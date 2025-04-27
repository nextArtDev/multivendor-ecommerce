'use client'
import { useRouter } from 'next/navigation'

import { FormEvent, useActionState, useEffect, useState } from 'react'
import { zarinpalPayment } from '../../lib/actions/payment'
import { usePathname } from '@/navigation'

export default function ZarinpalPayment({ orderId }: { orderId: string }) {
  const path = usePathname()
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState<string>()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  //   useEffect(() => {
  //     getClientSecret()
  //   }, [orderId])

  const [ActionState, zarinpalPaymentAction, pending] = useActionState(
    zarinpalPayment.bind(null, path, orderId as string),
    {
      errors: {},
      payment: {},
    }
  )
  console.log({ ActionState })
  router.push(ActionState.payment?.url)
  //   const getClientSecret = async () => {
  //     const res = await zarinpalPayment(orderId)
  //     if (res.clientSecret) setClientSecret(res.clientSecret)
  //   }

  //   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  //     event.preventDefault()
  //     setLoading(true)

  //     const { error: submitError } = await elements.submit()
  //     if (submitError) {
  //       setErrorMessage(submitError.message)
  //       setLoading(false)
  //       return
  //     }

  //     if (clientSecret) {
  //       const { error, paymentIntent } = await stripe.confirmPayment({
  //         elements,
  //         clientSecret,
  //         confirmParams: {
  //           return_url: 'http://localhost:3000',
  //         },
  //         redirect: 'if_required',
  //       })

  //       if (!error && paymentIntent) {
  //         try {
  //           const res = await createZarinpalPayment(orderId, paymentIntent)
  //           if (!res.paymentDetails?.paymentInetntId) throw new Error('Failed')
  //           router.refresh()
  //         } catch (error: any) {
  //           setErrorMessage(error.toString())
  //         }
  //       }
  //     }
  //     setLoading(false)
  //   }

  //   if (!clientSecret) {
  //     return (
  //       <div className="flex items-center justify-center">
  //         <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white">
  //           <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
  //             Loading...
  //           </span>
  //         </div>
  //       </div>
  //     )
  //   }
  return (
    <form action={zarinpalPaymentAction} className="bg-white p-2 rounded-md">
      {/* {clientSecret && <PaymentElement />} */}
      {errorMessage && (
        <div className="tetx-sm text-red-500">{errorMessage}</div>
      )}
      <button
        disabled={pending}
        className="text-white w-full p-5 bg-black mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse"
      >
        {pending ? 'Processing' : 'Pay'}
      </button>
    </form>
  )
}
