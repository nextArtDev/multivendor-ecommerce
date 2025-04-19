'use server'
// import { getShippingDetails } from "@/components/amazon/lib/queries/product"
import { prisma } from '@/lib/prisma'
import { CartProductType, CartWithCartItemsType } from '../../types'
import { currentUser } from '@/lib/auth'
import {
  FreeShippingWithCountriesAndCitiesType,
  getShippingDetails,
} from '@/components/amazon/lib/queries/product'
import { getCookie } from 'cookies-next'
import { CartItem, Country, Store } from '@prisma/client'
import { cookies } from 'next/headers'

export const saveUserCart = async (
  cartProducts: CartProductType[]
): Promise<boolean> => {
  // Get current user
  const user = await currentUser()

  // Ensure user is authenticated
  if (!user) throw new Error('Unauthenticated.')

  const userId = user.id
  if (!userId) throw new Error('Unauthenticated.')

  // Search for existing user cart
  const userCart = await prisma.cart.findFirst({
    where: { userId },
  })

  // Delete any existing user cart
  if (userCart) {
    await prisma.cart.delete({
      where: {
        userId,
      },
    })
  }

  // Fetch product, variant, and size data from the database for validation
  const validatedCartItems = await Promise.all(
    cartProducts.map(async (cartProduct) => {
      const { productId, variantId, sizeId, quantity } = cartProduct

      // Fetch the product, variant, and size from the database
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          images: true,
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
      // const countryCookie = getCookie('userCountry', { cookies })

      let details = {
        shippingFee: 0,
        extraShippingFee: 0,
        isFreeShipping: false,
      }

      // if (countryCookie) {
      //   const country = JSON.parse(countryCookie)
      //   const temp_details = await getShippingDetails(
      //     product.shippingFeeMethod,
      //     country,
      //     product.store,
      //     product.freeShipping,
      //     ''
      //   )
      //   if (typeof temp_details !== 'boolean') {
      //     details = temp_details
      //   }
      // }
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

  // Recalculate the cart's total price and shipping fees
  const subTotal = validatedCartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  const shippingFees = validatedCartItems.reduce(
    (acc, item) => acc + item.shippingFee,
    0
  )

  const total = subTotal + shippingFees

  // Save the validated items to the cart in the database
  const cart = await prisma.cart.create({
    data: {
      cartItems: {
        create: validatedCartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          sizeId: item.sizeId,
          storeId: item.storeId,
          sku: item.sku,
          productSlug: item.productSlug,
          variantSlug: item.variantSlug,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
          shippingFee: item.shippingFee,
          totalPrice: item.totalPrice,
        })),
      },
      shippingFees,
      subTotal,
      total,
      userId,
    },
  })
  if (cart) return true
  return false
}

export const updateCartWithLatest = async (
  cartProducts: CartProductType[]
): Promise<CartProductType[]> => {
  // Fetch product, variant, and size data from the database for validation
  const validatedCartItems = await Promise.all(
    cartProducts.map(async (cartProduct) => {
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
          images: true,
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

      // Calculate Shipping details
      const countryCookie = await getCookie('userCountry', { cookies })

      let details = {
        shippingService: product.store.defaultShippingService,
        shippingFee: 0,
        extraShippingFee: 0,
        isFreeShipping: false,
        deliveryTimeMin: 0,
        deliveryTimeMax: 0,
      }

      if (countryCookie) {
        const country = JSON.parse(countryCookie)
        const temp_details = await getShippingDetails(
          product.shippingFeeMethod,
          country,
          product.store,
          product.freeShipping,
          !!product.freeShipping
        )

        if (typeof temp_details !== 'boolean') {
          details = temp_details
        }
      }

      const price = size.discount
        ? size.price - (size.price * size.discount) / 100
        : size.price

      const validated_qty = Math.min(quantity, size.quantity)

      return {
        productId,
        variantId,
        productSlug: product.slug,
        variantSlug: variant.slug,
        sizeId,
        sku: variant.sku,
        name: product.name,
        variantName: variant.variantName,
        images: product.images,
        variantImage: variant.variantImage[0].url,
        stock: size.quantity,
        weight: variant.weight,
        shippingMethod: product.shippingFeeMethod,
        size: size.size,
        quantity: validated_qty,
        price,
        shippingService: details.shippingService,
        shippingFee: details.shippingFee,
        extraShippingFee: details.extraShippingFee,
        deliveryTimeMin: details.deliveryTimeMin,
        deliveryTimeMax: details.deliveryTimeMax,
        isFreeShipping: details.isFreeShipping,
      }
    })
  )
  return validatedCartItems
}

export const updateCheckoutProductstWithLatest = async (
  cartProducts: CartItem[],
  address: Country | undefined
): Promise<CartWithCartItemsType> => {
  // Fetch product, variant, and size data from the database for validation
  const validatedCartItems = await Promise.all(
    cartProducts.map(async (cartProduct) => {
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

      // Calculate Shipping details
      const countryCookie = await getCookie('userCountry', { cookies })

      const country = address
        ? address
        : countryCookie
        ? JSON.parse(countryCookie)
        : null

      if (!country) {
        throw new Error("Couldn't retrieve country data")
      }

      let shippingFee = 0

      const { shippingFeeMethod, freeShipping, store } = product

      const fee = await getProductShippingFee(
        shippingFeeMethod,
        country,
        store,
        freeShipping,
        variant.weight,
        quantity
      )

      if (fee) {
        shippingFee = fee
      }

      const price = size.discount
        ? size.price - (size.price * size.discount) / 100
        : size.price

      const validated_qty = Math.min(quantity, size.quantity)

      const totalPrice = price * validated_qty + shippingFee

      try {
        const newCartItem = await prisma.cartItem.update({
          where: {
            id: cartProduct.id,
          },
          data: {
            name: `${product.name} · ${variant.variantName}`,
            image: variant.variantImage[0].url,
            price,
            quantity: validated_qty,
            shippingFee,
            totalPrice,
          },
        })
        return newCartItem
      } catch (error) {
        return cartProduct
      }
    })
  )

  // Apply coupon if exist
  const cartCoupon = await prisma.cart.findUnique({
    where: {
      id: cartProducts[0].cartId,
    },
    select: {
      coupon: {
        include: {
          store: true,
        },
      },
    },
  })
  // Recalculate the cart's total price and shipping fees
  const subTotal = validatedCartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  const shippingFees = validatedCartItems.reduce(
    (acc, item) => acc + item.shippingFee,
    0
  )

  let total = subTotal + shippingFees

  // Apply coupon discount if applicable
  if (cartCoupon?.coupon) {
    const { coupon } = cartCoupon

    const currentDate = new Date()
    const startDate = new Date(coupon.startDate)
    const endDate = new Date(coupon.endDate)

    if (currentDate > startDate && currentDate < endDate) {
      // Check if the coupon applies to any store in the cart
      const applicableStoreItems = validatedCartItems.filter(
        (item) => item.storeId === coupon.storeId
      )

      if (applicableStoreItems.length > 0) {
        // Calculate subtotal for the coupon's store (including shipping fees)
        const storeSubTotal = applicableStoreItems.reduce(
          (acc, item) => acc + item.price * item.quantity + item.shippingFee,
          0
        )
        // Apply coupon discount to the store's subtotal
        const discountedAmount = (storeSubTotal * coupon.discount) / 100
        total -= discountedAmount
      }
    }
  }

  const cart = await prisma.cart.update({
    where: {
      id: cartProducts[0].cartId,
    },
    data: {
      subTotal,
      shippingFees,
      total,
    },
    include: {
      cartItems: true,
      coupon: {
        include: {
          store: true,
        },
      },
    },
  })

  if (!cart) throw new Error('Somethign went wrong !')

  return cart
}

export const getProductShippingFee = async (
  shippingFeeMethod: string,
  userCountry: Country,
  store: Store,
  freeShipping: FreeShippingWithCountriesAndCitiesType | null,
  weight: number,
  quantity: number
) => {
  // Fetch country information based on userCountry.name and userCountry.code
  const country = await prisma.country.findUnique({
    where: {
      name: userCountry.name,
      code: userCountry.code,
    },
  })

  if (country) {
    // Check if the user qualifies for free shipping
    if (freeShipping) {
      const free_shipping_countries = freeShipping.eligibaleCountries
      const isEligableForFreeShipping = free_shipping_countries.some(
        (c) => c.countryId === country.name
      )
      if (isEligableForFreeShipping) {
        return 0 // Free shipping
      }
    }

    // Fetch shipping rate from the database for the given store and country
    const shippingRate = await prisma.shippingRate.findFirst({
      where: {
        countryId: country.id,
        storeId: store.id,
      },
    })

    // Destructure the shippingRate with defaults
    const {
      shippingFeePerItem = store.defaultShippingFeePerItem,
      shippingFeeForAdditionalItem = store.defaultShippingFeeForAdditionalItem,
      shippingFeePerKg = store.defaultShippingFeePerKg,
      shippingFeeFixed = store.defaultShippingFeeFixed,
    } = shippingRate || {}

    // Calculate the additional quantity (excluding the first item)
    const additionalItemsQty = quantity - 1

    // Define fee calculation methods in a map (using functions)
    const feeCalculators: Record<string, () => number> = {
      ITEM: () =>
        shippingFeePerItem + shippingFeeForAdditionalItem * additionalItemsQty,
      WEIGHT: () => shippingFeePerKg * weight * quantity,
      FIXED: () => shippingFeeFixed,
    }

    // Check if the fee calculation method exists and calculate the fee
    const calculateFee = feeCalculators[shippingFeeMethod]
    if (calculateFee) {
      return calculateFee() // Execute the corresponding calculation
    }

    // If no valid shipping method is found, return 0
    return 0
  }

  // Return 0 if the country is not found
  return 0
}

export const getUserShippingAddresses = async () => {
  try {
    // Get current user
    const user = await currentUser()

    // Ensure user is authenticated
    if (!user) throw new Error('Unauthenticated.')

    // Retrieve all shipping addresses for the specified user
    const shippingAddresses = await prisma.shippingAddress.findMany({
      where: {
        userId: user.id,
      },
      include: {
        country: true,
        user: true,
        province: true,
        city: true,
      },
    })

    return shippingAddresses
  } catch (error) {
    // Log and re-throw any errors
    throw error
  }
}
