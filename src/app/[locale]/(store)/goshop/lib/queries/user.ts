// import { getShippingDetails } from "@/components/amazon/lib/queries/product"
import { prisma } from '@/lib/prisma'
import { CartProductType } from '../../types'
import { currentUser } from '@/lib/auth'
import { getShippingDetails } from '@/components/amazon/lib/queries/product'
import { getCookie } from 'cookies-next'

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
      //   const countryCookie = getCookie('userCountry', { cookies })

      let details = {
        shippingFee: 0,
        extraShippingFee: 0,
        isFreeShipping: false,
      }

      //   if (countryCookie) {
      //     const country = JSON.parse(countryCookie)
      //     const temp_details = await getShippingDetails(
      //       product.shippingFeeMethod,
      //       country,
      //       product.store,
      //       product.freeShipping
      //     )
      //     if (typeof temp_details !== 'boolean') {
      //       details = temp_details
      //     }
      //   }
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
      const countryCookie = getCookie('userCountry', { cookies })

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
        image: variant.variantImage[0].url,
        variantImage: variant.variantImage,
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
