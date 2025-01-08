import * as z from 'zod'

export const CategoryFormSchema = z.object({
  name: z
    .string({
      required_error: 'Category name is required.',
      invalid_type_error: 'Category name must be a string.',
    })
    .min(2, { message: 'Category name must be at least 2 characters long.' })
    .max(50, { message: 'Category name cannot exceed 50 characters.' })
    .regex(/^[a-zA-Z0-9\s'&-‌\u0600-\u06FF]+$/, {
      message:
        'Only letters, numbers, and spaces are allowed in the category name.',
    }),
  //   image: z
  //     .object({
  //       url: z.string(),
  //     })
  //     .array()
  //     .length(1, 'Choose a category image.'),
  images: z.any(),
  // .refine((files) => !!files, {
  //   message: 'قسمت عکس نمی‌تواند خالی باشد.',
  // }),
  // .refine((files) => {
  //   return files?.size <= MAX_FILE_SIZE
  // }, `حجم عکس از 5 مگابایت بیشتر است!`)
  // .refine(
  //   (files) => ACCEPTED_IMAGE_TYPES.includes(files?.type),
  //   // 'Only .jpg, .jpeg, .png and .webp formats are supported.'
  //   'تنها فرمتهای قابل پشتیبانی .jpg .jpeg .png و webp هستند.'
  // ),
  url: z
    .string({
      required_error: 'Category url is required',
      invalid_type_error: 'Category url must be a string',
    })
    .min(2, { message: 'Category url must be at least 2 characters long.' })
    .max(50, { message: 'Category url cannot exceed 50 characters.' })
    .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9\s'&-‌\u0600-\u06FF]+$/, {
      message:
        'Only letters, numbers, hyphen, and underscore are allowed in the category url, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.',
    }),
  featured: z.boolean().default(false),
})
