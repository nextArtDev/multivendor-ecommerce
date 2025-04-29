'use server'

import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
// import { permanentRedirect, redirect, RedirectType } from 'next/navigation'

import ZarinPalCheckout from 'zarinpal-checkout'

//https://www.zarinpal.com/docs/paymentGateway/connectToGateway.html#%D8%A8%D8%A7%D8%B2%DA%AF%D8%B4%D8%AA-%D8%A8%D9%87-%D9%88%D8%A8%E2%80%8C%D8%B3%D8%A7%DB%8C%D8%AA-%D9%BE%D8%B0%DB%8C%D8%B1%D9%86%D8%AF%D9%87

interface ZarinpalPaymentApprovalFormState {
  errors: {
    // name?: string[]
    Authority?: string[]
    Status?: string[]
    orderId?: string[]
    amount?: string[]

    _form?: string[]
  }
  // payment?: {
  //   status?: number
  //   authority?: string
  //   url?: string
  // }
}

export async function zarinpalPaymentApproval(
  path: string,
  orderId: string,
  Authority: string,
  Status: string //NOK & OK
  // //   amount: number,
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // formState: ZarinpalPaymentApprovalFormState,
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // formData: FormData
): Promise<ZarinpalPaymentApprovalFormState> {
  // const headerResponse = await headers()
  // const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  //   console.log({ orderId })
  const zarinpal = ZarinPalCheckout.create(
    process.env.ZARINPAL_KEY as string,
    true
    // 'IRT'
  )

  const user = await currentUser()
  if (!user || !user.id) {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  // console.log(result)
  if (!orderId) {
    return {
      errors: {
        _form: ['سفارش در دسترس نیست!'],
      },
    }
  }
  if (!Status && !Authority) {
    return {
      errors: {
        _form: ['پاسخ درگاه پرداخت معتبر نیست!'],
      },
    }
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
        authority: Authority,
      },
    })
    if (!order) {
      return {
        errors: {
          _form: ['سفارش حذف شده است!'],
        },
      }
    }
    if (Status === 'OK') {
      const verification = await zarinpal.PaymentVerification({
        Amount: order.total, // In Tomans
        Authority,
      })

      console.log({ verification })
      if (verification.status === 100) {
        console.log(`Verified! Ref ID: ${verification.refId}`)

        await prisma.order.update({
          where: {
            id: orderId,
            userId: user.id,
          },
          data: {
            paymentStatus: 'Paid',
          },
        })
        // const paymentDetailes = await prisma.paymentDetails.update({
        //   where: {
        //     orderId: order.id,
        //   },
        //   data: {
        //     paymentInetntId: verification.refId.toString(),
        //   },
        // })
        // console.log({ paymentDetailes })
      } else if (verification.status !== 100) {
        console.log(verification.status)
        return {
          errors: {
            _form: ['اطلاعات پرداخت نادرست است!'],
          },
        }
      }
    } else if (Status === 'NOK') {
      return {
        errors: {
          _form: ['پرداخت با خطا مواجه شده است!'],
        },
      }
    }
    // const order = await prisma.order.update({
    //   where: {
    //     id: orderId,
    //     userId: user.id,
    //   },
    //   data: {
    //     paymentStatus: 'Paid',
    //   },
    // })

    // if (payment.status === 100) {
    //   return {
    //     payment,
    //     errors: {},
    //   }
    // } else {
    //   return {
    //     errors: {
    //       _form: ['مشکلی در پرداخت پیش آمده، لطفا دوباره امتحان کنید!'],
    //     },
    //   }
    // }

    // console.log(payment.url)
    //    amount: Math.round(order.total * 100),
    // const isExisting:
    //   | (Review & {
    //       images: { id: string; key: string }[] | null
    //     })
    //   | null = await prisma.review.findFirst({
    //   where: { id: reviewId, userId: user.id, productId },
    //   include: {
    //     images: { select: { id: true, key: true } },
    //   },
    // })
    // if (!isExisting) {
    //   return {
    //     errors: {
    //       _form: ['نظر حذف شده است!'],
    //     },
    //   }
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
  }
  revalidatePath(path)
  // redirect(`${payment.}/goshop/orders/${orderId}`)
}
interface ZarinpalPaymentFormState {
  errors: {
    // name?: string[]
    // featured?: string[]
    // url?: string[]
    orderId?: string[]
    amount?: string[]

    _form?: string[]
  }
  payment?: {
    status?: number
    authority?: string
    url?: string
  }
}

export async function zarinpalPayment(
  path: string,
  orderId: string,
  //   amount: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formState: ZarinpalPaymentFormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData
): Promise<ZarinpalPaymentFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  //   console.log({ orderId })
  const zarinpal = ZarinPalCheckout.create(
    process.env.ZARINPAL_KEY as string,
    true
    // 'IRT'
  )

  const user = await currentUser()
  if (!user || !user.id) {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  // console.log(result)
  if (!orderId) {
    return {
      errors: {
        _form: ['سفارش در دسترس نیست!'],
      },
    }
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
    })

    if (!order) {
      return {
        errors: {
          _form: ['سفارش حذف شده است!'],
        },
      }
    }

    const payment = await zarinpal.PaymentRequest({
      Amount: +order?.total, // In Tomans
      //   CallbackURL: `${locale}/goshop/order/${orderId}`,
      CallbackURL: `http://localhost:3000/${locale}/goshop/order/${orderId}`,
      Description: 'A Payment from Go Shop',
      // Email: 'hi@siamak.work',
      Mobile: user.phone,
    })
    // console.log({ payment })
    await prisma.order.update({
      where: {
        id: orderId,
        userId: user.id,
      },
      data: {
        authority: payment.authority,
      },
    })
    if (payment.status === 100) {
      return {
        payment,
        errors: {},
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی در پرداخت پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
    // console.log({ payment })
    // permanentRedirect(payment.url, RedirectType.push)

    //   .then((response) => {
    //     if (response.status === 100) {
    //       console.log(response.url)
    //     }
    //   })
    //   .catch((err) => {
    //     console.error(err)
    //   })
    // console.log(payment.url)
    //    amount: Math.round(order.total * 100),
    // const isExisting:
    //   | (Review & {
    //       images: { id: string; key: string }[] | null
    //     })
    //   | null = await prisma.review.findFirst({
    //   where: { id: reviewId, userId: user.id, productId },
    //   include: {
    //     images: { select: { id: true, key: true } },
    //   },
    // })
    // if (!isExisting) {
    //   return {
    //     errors: {
    //       _form: ['نظر حذف شده است!'],
    //     },
    //   }
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
  }
  revalidatePath(path)
  // redirect(`${payment.}/goshop/orders/${orderId}`)
}
