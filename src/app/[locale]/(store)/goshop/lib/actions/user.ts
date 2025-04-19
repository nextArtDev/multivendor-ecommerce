'use server'

import { auth } from '@/auth'
import { getShippingDetails } from '@/components/amazon/lib/queries/product'
import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ShippingAddress } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDeliveryDetailsForStoreByCountry } from '../queries/product'

interface FollowStoreFormState {
  //   success?: boolean
  errors?: {
    storeId?: string[]

    _form?: string[]
  }
}

export async function followStore(
  path: string,
  storeId: string,
  formState: FollowStoreFormState,
  formData: FormData
): Promise<FollowStoreFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const session = await auth()
  if (!session || !session.user) {
    redirect(`/${locale}/login`)
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }

  try {
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    })
    if (!store) {
      return {
        errors: {
          _form: ['فروشگاه حذف شده است!'],
        },
      }
    }

    const userData = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })
    if (!userData) {
      return {
        errors: {
          _form: ['کاربر حذف شده است!'],
        },
      }
    }

    const userFollowingStore = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        following: {
          some: {
            id: storeId,
          },
        },
      },
    })

    if (userFollowingStore) {
      // Unfollow the store and return false
      await prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          followers: {
            disconnect: { id: userData.id },
          },
        },
      })

      //   return { success: false }
    } else {
      // Follow the store and return true
      await prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          followers: {
            connect: {
              id: userData.id,
            },
          },
        },
      })
      //   return { success: true }
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  } finally {
    revalidatePath(path)
    redirect(path)
  }
}

export const upsertShippingAddress = async (address: ShippingAddress) => {
  try {
    // console.log({ address })
    // const headerResponse = await headers()
    // const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
    // Get current user
    const user = await currentUser()

    // Ensure user is authenticated
    if (!user) throw new Error('Unauthenticated.')

    // Ensure address data is provided
    if (!address) throw new Error('Please provide address data.')

    // Handle making the rest of addresses default false when we are adding a new default
    if (address.default) {
      const addressDB = await prisma.shippingAddress.findUnique({
        where: { id: address.id },
      })
      if (addressDB) {
        try {
          await prisma.shippingAddress.updateMany({
            where: {
              userId: user.id,
              default: true,
            },
            data: {
              default: false,
            },
          })
        } catch {
          throw new Error('Could not reset default shipping addresses')
        }
      }
    }

    // Upsert shipping address into the database
    const upsertedAddress = await prisma.shippingAddress.upsert({
      where: {
        id: address.id,
      },
      update: {
        ...address,
        userId: user.id,
      },
      create: {
        ...address,
        userId: user.id as string,
      },
    })

    return upsertedAddress
  } catch (error) {
    // Log and re-throw any errors
    throw error
  }
}
export const updateDefaultShippingAddress = async (addressId: string) => {
  try {
    // console.log({ address })
    // const headerResponse = await headers()
    // const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
    // Get current user
    const user = await currentUser()

    // Ensure user is authenticated
    if (!user) throw new Error('Unauthenticated.')

    // Ensure address data is provided
    if (!addressId) throw new Error('Please provide address data.')

    // Handle making the rest of addresses default false when we are adding a new default

    const addressDB = await prisma.shippingAddress.findUnique({
      where: { id: addressId },
    })
    if (addressDB) {
      await prisma.shippingAddress.updateMany({
        where: {
          userId: user.id,
          default: true,
        },
        data: {
          default: false,
        },
      })
    }

    const updatedAddress = await prisma.shippingAddress.update({
      where: {
        id: addressId,
      },
      data: {
        default: true,
        userId: user.id,
      },
    })

    return updatedAddress
  } catch (error) {
    // Log and re-throw any errors
    throw error
  }
}

export const placeOrder = async (
  shippingAddress: ShippingAddress,
  cartId: string
): Promise<{ orderId: string }> => {
  // Ensure the user is authenticated
  const user = await currentUser()
  if (!user || !user.id) throw new Error('Unauthenticated.')

  const userId = user.id

  // Fetch user's cart with all items
  const cart = await prisma.cart.findUnique({
    where: {
      id: cartId,
    },
    include: {
      cartItems: true,
      coupon: true,
    },
  })

  if (!cart) throw new Error('Cart not found.')

  const cartItems = cart.cartItems
  const cartCoupon = cart.coupon // The coupon, if it exists

  // Fetch product, variant, and size data from the database for validation
  const validatedCartItems = await Promise.all(
    cartItems.map(async (cartProduct) => {
      const { productId, variantId, sizeId, quantity } = cartProduct

      // Fetch the product, variant, and size from the database
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          store: true,
          freeShipping: {
            include: {
              eligibaleCountries: true,
            },
          },
          variants: {
            where: {
              id: variantId,
            },
            include: {
              sizes: {
                where: {
                  id: sizeId,
                },
              },
              variantImage: true,
            },
          },
        },
      })

      if (
        !product ||
        product.variants.length === 0 ||
        product.variants[0].sizes.length === 0
      ) {
        throw new Error(
          `Invalid product, variant, or size combination for productId ${productId}, variantId ${variantId}, sizeId ${sizeId}`
        )
      }

      const variant = product.variants[0]
      const size = variant.sizes[0]

      // Validate stock and price
      const validQuantity = Math.min(quantity, size.quantity)

      const price = size.discount
        ? size.price - size.price * (size.discount / 100)
        : size.price

      // Calculate Shipping details
      const countryId = shippingAddress.countryId

      const temp_country = await prisma.country.findUnique({
        where: {
          id: countryId,
        },
      })

      if (!temp_country)
        throw new Error('Failed to get Shipping details for order.')

      const country = {
        name: temp_country.name,
        code: temp_country.code,
        city: '',
        region: '',
      }

      let details = {
        shippingFee: 0,
        extraShippingFee: 0,
        isFreeShipping: false,
      }

      if (country) {
        const temp_details = await getShippingDetails(
          product.shippingFeeMethod,
          country,
          product.store,
          product.freeShipping
        )
        if (typeof temp_details !== 'boolean') {
          details = temp_details
        }
      }
      let shippingFee = 0
      const { shippingFeeMethod } = product
      if (shippingFeeMethod === 'ITEM') {
        shippingFee =
          quantity === 1
            ? details.shippingFee
            : details.shippingFee + details.extraShippingFee * (quantity - 1)
      } else if (shippingFeeMethod === 'WEIGHT') {
        shippingFee = details.shippingFee * variant.weight * quantity
      } else if (shippingFeeMethod === 'FIXED') {
        shippingFee = details.shippingFee
      }

      const totalPrice = price * validQuantity + shippingFee
      return {
        productId,
        variantId,
        productSlug: product.slug,
        variantSlug: variant.slug,
        sizeId,
        storeId: product.storeId,
        sku: variant.sku,
        name: `${product.name} · ${variant.variantName}`,
        image: variant.variantImage[0].url,
        size: size.size,
        quantity: validQuantity,
        price,
        shippingFee,
        totalPrice,
      }
    })
  )

  // Define the type for grouped items by store
  type GroupedItems = { [storeId: string]: typeof validatedCartItems }

  // Group validated items by store
  const groupedItems = validatedCartItems.reduce<GroupedItems>((acc, item) => {
    if (!acc[item.storeId]) acc[item.storeId] = []
    acc[item.storeId].push(item)
    return acc
  }, {} as GroupedItems)

  // Create the order
  const order = await prisma.order.create({
    data: {
      userId: userId,
      shippingAddressId: shippingAddress.id,
      orderStatus: 'Pending',
      paymentStatus: 'Pending',
      subTotal: 0, // Will calculate below
      shippingFees: 0, // Will calculate below
      total: 0, // Will calculate below
    },
  })

  // Iterate over each store's items and create OrderGroup and OrderItems
  let orderTotalPrice = 0
  let orderShippingFee = 0

  for (const [storeId, items] of Object.entries(groupedItems)) {
    // Calculate store-specific totals
    const groupedTotalPrice = items.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    )

    const groupShippingFees = items.reduce(
      (acc, item) => acc + item.shippingFee,
      0
    )

    const { shippingService, deliveryTimeMin, deliveryTimeMax } =
      await getDeliveryDetailsForStoreByCountry(
        storeId,
        shippingAddress.countryId
      )

    // Check coupon store
    const check = storeId === cartCoupon?.storeId

    // Calculate discount based on coupon
    let discountedAmount = 0
    if (check && cartCoupon) {
      discountedAmount = (groupedTotalPrice * cartCoupon.discount) / 100
    }

    // Calculate the total after applying the discount
    const totalAfterDiscount = groupedTotalPrice - discountedAmount
    // Create an OrderGroup for this store
    const orderGroup = await prisma.orderGroup.create({
      data: {
        orderId: order.id,
        storeId: storeId,
        status: 'Pending',
        subTotal: groupedTotalPrice - groupShippingFees,
        shippingFees: groupShippingFees,
        total: totalAfterDiscount,
        shippingService: shippingService || 'International Delivery',
        shippingService_fa: shippingService || 'International Delivery',
        shippingDeliveryMin: deliveryTimeMin || 7,
        shippingDeliveryMax: deliveryTimeMax || 30,
        couponId: check && cartCoupon ? cartCoupon?.id : null,
      },
    })

    // Create OrderItems for this OrderGroup
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderGroupId: orderGroup.id,
          productId: item.productId,
          variantId: item.variantId,
          sizeId: item.sizeId,
          productSlug: item.productSlug,
          variantSlug: item.variantSlug,
          sku: item.sku,
          name: item.name,
          image: item.image,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          shippingFee: item.shippingFee,
          totalPrice: item.totalPrice,
        },
      })
    }

    // Update order totals
    orderTotalPrice += totalAfterDiscount
    orderShippingFee += groupShippingFees
  }

  // Update the main order with the final totals
  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      subTotal: orderTotalPrice - orderShippingFee,
      shippingFees: orderShippingFee,
      total: orderTotalPrice,
    },
  })

  // Delete cart
  /*
  await prisma.cart.delete({
    where: {
      id: cartId,
    },
  });
  */

  return {
    orderId: order.id,
  }
}

export const emptyUserCart = async () => {
  try {
    // Ensure the user is authenticated
    const user = await currentUser()
    if (!user) throw new Error('Unauthenticated.')

    const userId = user.id

    const res = await prisma.cart.delete({
      where: {
        userId,
      },
    })
    if (res) return true
  } catch (error) {
    throw error
  }
}
