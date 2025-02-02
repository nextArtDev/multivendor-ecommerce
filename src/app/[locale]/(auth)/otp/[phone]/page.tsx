'use client'

import { useState, useTransition } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import OtpInput from '@/components/auth/otp-input'

import { FormError } from '@/components/auth/form-error'
import { FormSuccess } from '@/components/auth/form-success'
import { useRouter } from '@/navigation'

import { activation } from '@/lib/actions/auth/register'
import { toast } from 'sonner'

type FormData = {
  otp: string
}

export default function OtpForm({ params }: { params: { phone: string } }) {
  const router = useRouter()

  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isPending, startTransition] = useTransition()
  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      otp: '',
    },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setError('')
    setSuccess('')

    startTransition(() => {
      activation({ phone: params.phone, verificationCode: data.otp }).then(
        (res) => {
          setError(res?.error)
          setSuccess(res?.success)
          if (res?.success) {
            toast(
              'ثبت نام شما با موفقیت انجام شد، لطفا وارد حساب کاربری خود شوید.'
            )
            router.push('/login')
          }
          if (res?.error) {
            // router.push('/register')
            reset()
          }
        }
      )
    })

    // console.log(data) // Handle form submission
    // const res = await activation({ id: userID, verificationCode: data.otp })
    // console.log(res)
  }

  // Function to trigger form submission programmatically
  const handleComplete = () => {
    handleSubmit(onSubmit)() // Invoke the submit handler
  }

  return (
    <form dir="ltr" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="otp"
        disabled={isPending}
        render={({ field: { onChange, value } }) => (
          <OtpInput
            disabled={isPending}
            value={value}
            valueLength={6}
            onChange={onChange}
            onComplete={handleComplete} // Pass the handleComplete function
          />
        )}
      />
      <FormError message={error} />
      <FormSuccess message={success} />
    </form>
  )
}
