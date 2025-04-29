'use client'
import { useRouter } from '@/navigation'
import { useSearchParams } from 'next/navigation'

import {
  FormEvent,
  useActionState,
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  zarinpalPayment,
  zarinpalPaymentApproval,
} from '../../lib/actions/payment'
import { usePathname } from '@/navigation'

export default function ZarinpalPayment({ orderId }: { orderId: string }) {
  const path = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [zarinpalResponse, setZarinpalResponse] = useState({
    Authority: '',
    Status: '',
  })

  // const [errorMessage, setErrorMessage] = useState<string>()
  // const [clientSecret, setClientSecret] = useState<string | null>(null)
  // const [loading, setLoading] = useState<boolean>(false)

  const verifyPayment = useCallback(async () => {
    const verif = await zarinpalPaymentApproval(
      path,
      orderId,
      zarinpalResponse.Authority,
      zarinpalResponse.Status
    )
    console.log({ verif })
  }, [path, orderId, zarinpalResponse.Authority, zarinpalResponse.Status])

  useEffect(() => {
    if (searchParams?.get('Authority') && searchParams?.get('Status')) {
      setZarinpalResponse({
        Authority: searchParams.get('Authority') as string,
        Status: searchParams.get('Status') as string,
      })
      verifyPayment()
    }
  }, [searchParams, verifyPayment])

  const [ActionState, zarinpalPaymentAction, pending] = useActionState(
    zarinpalPayment.bind(null, path, orderId as string),
    {
      errors: {},
      payment: {},
    }
  )
  console.log({ ActionState })
  useEffect(() => {
    if (ActionState.payment?.url) {
      router.push(ActionState.payment?.url)
    }
  }, [ActionState.payment?.url, router])

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
  console.log(zarinpalResponse.Status)
  if (zarinpalResponse.Status) {
    return (
      <div className="flex items-center justify-center">
        {zarinpalResponse.Status === 'OK' ? 'Sucsess' : 'Failed'}
        {/* <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          </span>
        </div> */}
      </div>
    )
  }
  return (
    <form action={zarinpalPaymentAction} className="bg-white p-2 rounded-md">
      {/* {clientSecret && <PaymentElement />} */}
      {/* {errorMessage && (
        <div className="tetx-sm text-red-500">{errorMessage}</div>
      )} */}
      <button
        disabled={pending}
        className="text-white w-full p-5 bg-black mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse"
      >
        {pending ? 'Processing' : 'Pay'}
      </button>
    </form>
  )
}
