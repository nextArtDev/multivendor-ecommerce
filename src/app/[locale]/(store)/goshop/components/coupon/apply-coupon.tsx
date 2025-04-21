import { CartWithCartItemsType } from '@/app/[locale]/(store)/goshop/types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Dispatch, SetStateAction, useActionState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApplyCouponFormSchema } from '../../lib/schemas/coupon'
import { toast } from 'sonner'
import { applyCoupon } from '../../lib/actions/coupon'
import { Button } from '@/components/ui/button'
import { usePathname } from '@/navigation'

export default function ApplyCouponForm({
  cartId,
  setCartData,
}: {
  cartId: string
  setCartData: Dispatch<SetStateAction<CartWithCartItemsType>>
}) {
  const path = usePathname()
  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof ApplyCouponFormSchema>>({
    mode: 'onChange', // Form validation mode
    resolver: zodResolver(ApplyCouponFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      coupon: '',
    },
  })

  const [formState, applyCouponAction, pending] = useActionState(
    applyCoupon.bind(null, path, cartId as string),
    {
      errors: {},
      success: '',
      updatedCart: undefined,
    }
  )

  useEffect(() => {
    if (formState.success) {
      toast.success(formState.success)
    } else if (formState.errors) {
      toast.error(
        formState?.errors?._form
          ? formState?.errors?._form.map((err) => err).join(' ,')
          : formState?.errors?.coupon &&
              formState?.errors?.coupon.map((err) => err).join(' ,')
      )
    }
    if (!!formState?.updatedCart) {
      // console.log('Updated Cart:', formState.updatedCart)
      setCartData(formState.updatedCart)
      // Update local state, UI, or perform other actions with updatedCart
    }
  }, [formState.errors, formState.success, formState.updatedCart, setCartData])
  // // Loading status& Errors
  // const { errors, isSubmitting } = form.formState

  // // Submit handler for form submission
  // const handleSubmit = async (
  //   values: z.infer<typeof ApplyCouponFormSchema>
  // ) => {
  //   try {
  //     const res = await applyCoupon(values.coupon, cartId)
  //     setCartData(res.cart)
  //     toast.success(res.message)
  //   } catch (error: any) {
  //     // Handling form submission errors
  //     toast.error(error.toString())
  //   }
  // }

  return (
    <div className="rounded-xl">
      <Form {...form}>
        {/* <form onSubmit={form.handleSubmit(handleSubmit)}> */}
        <form action={applyCouponAction}>
          {/* Form items */}
          <div className="relative bg-gray-100 rounded-2xl shadow-sm p-1.5 hover:shadow-md">
            <FormField
              control={form.control}
              name="coupon"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input
                      type="text"
                      className="w-full pl-8 pr-24 py-3 text-base text-main-primary bg-transparent rounded-lg focus:outline-none"
                      placeholder="Coupon"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              disabled={pending}
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 w-20 rounded-2xl"
            >
              Apply
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
