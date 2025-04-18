import { z } from 'zod'

export const StoreShippingFormSchema = z.object({
  defaultShippingService: z
    .string({
      required_error: 'Shipping service name is required.',
    })
    .min(2, 'Shipping service name must be at least 2 characters long.')
    .max(50, { message: 'Shipping service name cannot exceed 50 characters.' }),
  defaultShippingFeePerItem: z.number(),
  defaultShippingFeeForAdditionalItem: z.number(),
  defaultShippingFeePerKg: z.number(),
  defaultShippingFeeFixed: z.number(),
  defaultDeliveryTimeMin: z.number(),
  defaultDeliveryTimeMax: z.number(),
  returnPolicy: z.string(),
})

export const ShippingRateFormSchema = z.object({
  shippingService: z
    .string({
      required_error: 'Shipping service name is required.',
      invalid_type_error: 'Shipping service name must be a string.',
    })
    .min(2, {
      message: 'Shipping service name must be at least 2 characters long.',
    })
    .max(50, { message: 'Shipping service name cannot exceed 50 characters.' }),
  countryId: z.string().uuid().optional(),
  countryName: z.string().optional(),
  shippingFeePerItem: z.number(),
  shippingFeeForAdditionalItem: z.number(),
  shippingFeePerKg: z.number(),
  shippingFeeFixed: z.number(),
  deliveryTimeMin: z.number(),
  deliveryTimeMax: z.number(),
  returnPolicy: z.string().min(1, 'Return policy is required.'),
})

export const ShippingAddressSchema = z.object({
  // countryId: z
  //   .string({
  //     required_error: 'Country is mandatory.',
  //     invalid_type_error: 'Country must be a valid string.',
  //   })
  //   .uuid(),
  firstName: z
    .string({
      required_error: 'First name is mandatory.',
      invalid_type_error: 'First name must be a valid string.',
    })
    .min(2, { message: 'First name should be at least 2 characters long.' })
    .max(50, { message: 'First name cannot exceed 50 characters.' })
    .regex(/^[a-zA-Z]+$/, {
      message: 'No special characters are allowed in name.',
    }),

  lastName: z
    .string({
      required_error: 'Last name is mandatory.',
      invalid_type_error: 'Last name must be a valid string.',
    })
    .min(2, { message: 'Last name should be at least 2 characters long.' })
    .max(50, { message: 'Last name cannot exceed 50 characters.' })
    .regex(/^[a-zA-Z]+$/, {
      message: 'No special characters are allowed in name.',
    }),
  phone: z
    .string({
      required_error: 'Phone number is mandatory.',
      invalid_type_error: 'Phone number must be a string',
    })
    .regex(/^\+?\d+$/, { message: 'Invalid phone number format.' }),

  address1: z
    .string({
      required_error: 'Address line 1 is mandatory.',
      invalid_type_error: 'Address line 1 must be a valid string.',
    })
    .min(5, { message: 'Address line 1 should be at least 5 characters long.' })
    .max(100, { message: 'Address line 1 cannot exceed 100 characters.' }),

  address2: z
    .string({
      invalid_type_error: 'Address line 2 must be a valid string.',
    })
    .max(100, { message: 'Address line 2 cannot exceed 100 characters.' })
    .optional(),

  // state: z
  //   .string({
  //     required_error: 'State is mandatory.',
  //     invalid_type_error: 'State must be a valid string.',
  //   })
  //   .min(2, { message: 'State should be at least 2 characters long.' })
  //   .max(50, { message: 'State cannot exceed 50 characters.' }),

  cityId: z
    .string({
      required_error: 'City is mandatory.',
      invalid_type_error: 'City must be a valid string.',
    })
    .min(2, { message: 'City should be at least 2 characters long.' })
    .max(50, { message: 'City cannot exceed 50 characters.' }),
  provinceId: z
    .string({
      required_error: 'province is mandatory.',
      invalid_type_error: 'province must be a valid string.',
    })
    .min(2, { message: 'province should be at least 2 characters long.' })
    .max(50, { message: 'province cannot exceed 50 characters.' }),

  zip_code: z
    .string({
      required_error: 'Zip code is mandatory.',
      invalid_type_error: 'Zip code must be a valid string.',
    })
    .min(2, { message: 'Zip code should be at least 2 characters long.' })
    .max(10, { message: 'Zip code cannot exceed 10 characters.' }),

  default: z.boolean().default(false),
})
