import { z } from 'zod'

export const ApplyCouponFormSchema = z.object({
  coupon: z
    .string({
      required_error: 'Coupon is required',
      invalid_type_error: 'Coupon must be a string',
    })
    .min(2, 'Coupon must be at least 2 characters.'),
})
