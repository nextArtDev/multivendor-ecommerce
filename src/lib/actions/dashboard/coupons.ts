'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { CouponFormSchema } from '@/lib/schemas/dashboard'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

interface CreateCouponFormState {
  success?: string
  errors: {
    code?: string[]
    discount?: string[]
    startDate?: string[]
    endDate?: string[]

    _form?: string[]
  }
}
export async function createCoupon(
  formData: FormData,
  storeUrl: string,
  path: string
): Promise<CreateCouponFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const result = CouponFormSchema.safeParse({
    code: formData.get('code'),
    discount: Number(formData.get('discount')),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
  })
  console.log(result.data)
  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  const session = await auth()
  if (
    !session ||
    !session.user ||
    !session.user.id ||
    session.user.role !== 'SELLER'
  ) {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }

  const store = await prisma.store.findUnique({
    where: {
      url: storeUrl,
      userId: session.user.id,
    },
  })
  if (!store) {
    return {
      errors: {
        _form: ['فروشگاه حذف شده است!'],
      },
    }
  }
  try {
    // Throw error if a coupon with the same code and storeId already exists
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        AND: [{ storeId: store.id }, { code: result.data.code }],
      },
    })

    if (existingCoupon) {
      return {
        errors: {
          _form: ['کوپن با این نام موجود است!'],
        },
      }
    }

    // Upsert coupon into the database
    await prisma.coupon.create({
      data: {
        storeId: store.id,
        code: result.data.code,
        discount: +result.data.discount,
        startDate: String(result.data.startDate),
        endDate: String(result.data.endDate),
      },
    })

    // return couponDetails
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
  }
  revalidatePath(path)
  redirect(`/${locale}/dashboard/seller/stores/${storeUrl}/coupons`)
}
