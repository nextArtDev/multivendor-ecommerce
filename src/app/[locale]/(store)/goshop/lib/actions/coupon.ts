'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ApplyCouponFormSchema } from '../schemas/coupon'
import { Cart, CartItem, Coupon, Store } from '@prisma/client'

type CartWithUpdatedCouponType = Cart & { cartItems: CartItem[] } & {
  coupon:
    | (Coupon & {
        store: Store
      })
    | null
}

interface CouponFormState {
  success?: string
  errors?: {
    coupon?: string[]

    _form?: string[]
  }
  updatedCart?: CartWithUpdatedCouponType
}

export async function applyCoupon(
  path: string,
  // couponCode: string,
  cartId: string,
  formState: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  const result = ApplyCouponFormSchema.safeParse({
    coupon: formData.get('coupon'),
  })
  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }

  // e cart: CartWithCartItemsType
  try {
    // Step 1: Fetch the coupon details
    const coupon = await prisma.coupon.findUnique({
      where: {
        code: result.data?.coupon,
      },
      include: {
        store: true,
      },
    })

    if (!coupon) {
      return {
        errors: {
          _form: ['Invalid Coupon Code!'],
        },
      }
    }

    // Step 2: Validate the coupon's date range
    const currentDate = new Date()
    const startDate = new Date(coupon.startDate)
    const endDate = new Date(coupon.endDate)

    if (currentDate < startDate || currentDate > endDate) {
      return {
        errors: {
          _form: ['Coupon is expired or not yet active.'],
        },
      }
    }

    // Step 3: Fetch the cart and validate its existence
    const cart = await prisma.cart.findUnique({
      where: {
        id: cartId,
      },
      include: {
        cartItems: true,
        coupon: true,
      },
    })

    if (!cart) {
      return {
        errors: {
          _form: ['Cart not found.'],
        },
      }
    }

    // Step 4: Ensure no coupon is already applied to the cart
    if (cart.couponId) {
      return {
        errors: {
          _form: ['A coupon is already applied to this cart.'],
        },
      }
    }

    // Step 5: Filter items from the store associated with the coupon
    const storeId = coupon.storeId

    const storeItems = cart.cartItems.filter((item) => item.storeId === storeId)

    if (storeItems.length === 0) {
      return {
        errors: {
          _form: [
            'No items in the cart belong to the store associated with this coupon.',
          ],
        },
      }
    }

    // Step 6: Calculate the discount on the store's items
    const storeSubTotal = storeItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    )

    const storeShippingTotal = storeItems.reduce(
      (acc, item) => acc + item.shippingFee,
      0
    )

    const storeTotal = storeSubTotal + storeShippingTotal

    const discountedAmount = (storeTotal * coupon.discount) / 100

    const newTotal = cart.total - discountedAmount

    // Step 7: Update the cart with the applied coupon and new total
    const updatedCart = await prisma.cart.update({
      where: {
        id: cartId,
      },
      data: {
        couponId: coupon.id,
        total: newTotal,
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
    return {
      success: `Coupon applied successfully. Discount: -$${discountedAmount.toFixed(
        2
      )} applied to items from ${coupon.store.name}.`,
      updatedCart,
    }
    // return {
    //   message: `Coupon applied successfully. Discount: -$${discountedAmount.toFixed(
    //     2
    //   )} applied to items from ${coupon.store.name}.`,
    //   cart: updatedCart,
    // }
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
    // redirect(path)
  }
}
