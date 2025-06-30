'use client'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { AlertDialog } from '@/components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { CouponFormSchema } from '@/lib/schemas/dashboard'

import { usePathname } from '@/navigation'
import { Coupon } from '@prisma/client'
import { NumberInput } from '@tremor/react'

// import { useQueryState } from 'nuqs'
import { DateTimePicker } from '@/components/shared/date-time-picker'

import { createCoupon } from '@/lib/actions/dashboard/coupons'
import { FC, useEffect, useTransition } from 'react'

interface CouponDetailProps {
  data?: Coupon
  storeUrl: string
}

const CouponDetails: FC<CouponDetailProps> = ({ data, storeUrl }) => {
  // console.log(data?.colors)

  const path = usePathname()

  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof CouponFormSchema>>({
    resolver: zodResolver(CouponFormSchema),
    defaultValues: {
      code: data?.code,
      discount: data?.discount,
      startDate: data?.startDate || new Date(new Date().setHours(0, 0, 0, 0)),
      endDate: data?.endDate || new Date(new Date().setHours(0, 0, 0, 0)),
    },
  })

  useEffect(() => {
    if (data) {
      form.reset(data)
    }
  }, [data, form])

  const handleSubmit = async (data: z.infer<typeof CouponFormSchema>) => {
    const formData = new FormData()

    // console.log({ data })
    const startDate =
      data?.startDate || new Date(new Date().setHours(0, 0, 0, 0))

    const startDateString =
      startDate instanceof Date ? startDate.toISOString() : startDate
    const endDate = data?.endDate || new Date(new Date().setHours(0, 0, 0, 0))

    const endDateString =
      endDate instanceof Date ? endDate.toISOString() : endDate

    formData.append('code', data.code)
    formData.append('discount', String(data.discount))
    formData.append('startDate', startDateString)
    formData.append('endDate', endDateString)

    startTransition(async () => {
      try {
        const res = await createCoupon(formData, storeUrl, path)
        if (res?.errors?.code) {
          form.setError('code', {
            type: 'custom',
            message: res?.errors.code?.join(' و '),
          })
        } else if (res?.errors?.discount) {
          form.setError('discount', {
            type: 'custom',
            message: res?.errors.discount?.join(' و '),
          })
        } else if (res?.errors?.startDate) {
          form.setError('startDate', {
            type: 'custom',
            message: res?.errors.startDate?.join(' و '),
          })
        } else if (res?.errors?.endDate) {
          form.setError('endDate', {
            type: 'custom',
            message: res?.errors.endDate?.join(' و '),
          })
        } else if (res?.errors?._form) {
          toast.error(res?.errors._form?.join(' و '))
        }
      } catch (error) {
        // This will catch the NEXT_REDIRECT error, which is expected when the redirect happens
        if (
          !(error instanceof Error && error.message.includes('NEXT_REDIRECT'))
        ) {
          toast.error('مشکلی پیش آمده.')
        }
      }
    })
  }

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Coupon Information</CardTitle>
          <CardDescription>
            {data?.id
              ? `Update ${data?.code} coupon information.`
              : ' Lets create a coupon. You can edit coupon later from the coupons table or the coupon page.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Coupon code</FormLabel>
                    <FormControl>
                      <Input placeholder="Coupon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Coupon discount</FormLabel>
                    <FormControl>
                      <NumberInput
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="%"
                        min={1}
                        className="!shadow-none rounded-md !text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DateTimePicker name="startDate" />
              <DateTimePicker name="endDate" />

              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'loading...'
                  : data?.id
                  ? 'Save coupon information'
                  : 'Create coupon'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  )
}

export default CouponDetails
