'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Province } from '@prisma/client'
import ProvinceCity from './province-city'
import cities from '@/constants/cities.json'
import { useQuery } from '@tanstack/react-query'
import { getAllProvinces } from '@/app/[locale]/(store)/goshop/lib/queries/address'
import { usePathname } from '@/navigation'
import { startTransition, useActionState, useTransition } from 'react'
import { setCityCookie } from '@/app/[locale]/(store)/goshop/lib/actions/cookie'

export const cookieFormSchema = z.object({
  provinceId: z.string(),
  cityId: z.string(),
})

export default function SelectProvinceForm({
  provinces,
}: {
  provinces?: Province[]
}) {
  // console.log({ provinces })
  const [_, startTransition] = useTransition()

  const { data, isPending } = useQuery({
    queryKey: ['provinces'],
    queryFn: () => getAllProvinces(),
    // staleTime: Infinity,
  })

  // if (!data) return null
  const form = useForm<z.infer<typeof cookieFormSchema>>({
    resolver: zodResolver(cookieFormSchema),
  })

  const path = usePathname()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  async function onSubmit(values: z.infer<typeof cookieFormSchema>) {
    console.log({ values })
    const formData = new FormData()

    formData.append('cityId', values.cityId)
    formData.append('provinceId', values.provinceId)

    try {
      startTransition(async () => {
        try {
          const res = await setCityCookie(formData, path)
          if (res?.errors?.cityId) {
            form.setError('cityId', {
              type: 'custom',
              message: res?.errors.cityId?.join(' و '),
            })
          } else if (res?.errors?.provinceId) {
            form.setError('provinceId', {
              type: 'custom',
              message: res?.errors.provinceId?.join(' و '),
            })
          }
          console.log({ res })
        } catch (error) {
          // This will catch the NEXT_REDIRECT error, which is expected when the redirect happens
          if (
            !(error instanceof Error && error.message.includes('NEXT_REDIRECT'))
          ) {
            toast.error('مشکلی پیش آمده.')
          }
        }
      })
    } catch {
      toast.error('مشکلی پیش آمده، لطفا دوباره امتحان کنید!')
    }
  }

  return (
    <div className="flex shrink-0 w-full h-full ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=" ">
          <div className="flex gap-4">
            {isPending ? (
              <>Loading...</>
            ) : !data ? (
              <>No Data</>
            ) : (
              <ProvinceCity
                provinceLabel=""
                provinces={data}
                className="w-full h-full relative"
              />
            )}
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  )
}
