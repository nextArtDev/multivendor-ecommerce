import { z } from 'zod'
import { zfd } from 'zod-form-data'

const imageObjectSchema = z.object({
  url: z.string(),
})

// Create the combined schema that accepts both Files and image objects
const imageSchema = z
  .union([
    z.array(
      zfd
        .file()
        .refine((file) => file.size < 5000000, {
          message: "File can't be bigger than 5MB.",
        })
        .refine(
          (file) =>
            ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(
              file.type
            ),
          {
            message: 'File format must be either jpg, jpeg, png or webp.',
          }
        )
    ),
    z
      .array(imageObjectSchema)
      .max(3, 'You can upload up to 3 images for the review.'),
    z.array(z.string()),
  ])
  .optional()

export const AddReviewSchema = z.object({
  variantName: z.string().min(1, 'Variant is required.'),
  //   variantImage: z.string().min(1, 'Variant image is required.'),
  rating: z.number().min(1, 'Please rate this product.'),
  size: z.string().min(1, 'Please select a size.'), // Ensures size cannot be empty
  review: z
    .string()
    .min(
      10,
      'Your feedback matters! Please write a review of minimum 10 characters.'
    ), // Ensures review cannot be empty
  quantity: z.string().default('1'),
  images: imageSchema,
  color: z.string({ required_error: 'Color is required.' }),
})
