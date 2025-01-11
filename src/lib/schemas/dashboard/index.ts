import * as z from 'zod'
import { zfd } from 'zod-form-data'

const imageSchema = z.union([
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
        message: 'File format must be either jpg, jpeg lub png.',
      }
    ),
  z.object({
    url: z.string(),
  }),
])
// How to call it: z.array(imageSchema).optional()
// const fileOrUrlSchema = <T extends z.ZodType>(fileSchema: T) =>
//   z.union([
//     fileSchema,
//     z.object({
//       url: z.string(),
//     }),
//   ])

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
  name_fa: z
    .string({
      required_error: 'Category name is required.',
      invalid_type_error: 'Category name must be a string.',
    })
    .min(2, { message: 'Category name must be at least 2 characters long.' })
    .max(50, { message: 'Category name cannot exceed 50 characters.' })
    .regex(/^[a-zA-Z0-9\s'&-‌\u0600-\u06FF]+$/, {
      message:
        'Only letters, numbers, and spaces are allowed in the category name.',
    })
    .optional(),
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

export const CategoryServerFormSchema = z.object({
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
  name_fa: z
    .string({
      required_error: 'Category name is required.',
      invalid_type_error: 'Category name must be a string.',
    })
    .min(2, { message: 'Category name must be at least 2 characters long.' })
    .max(50, { message: 'Category name cannot exceed 50 characters.' })
    .regex(/^[a-zA-Z0-9\s'&-‌\u0600-\u06FF]+$/, {
      message:
        'Only letters, numbers, and spaces are allowed in the category name.',
    })
    .optional(),
  //   image: z
  //     .object({
  //       url: z.string(),
  //     })
  //     .array()
  //     .length(1, 'Choose a category image.'),
  // images: zfd
  //   .file()
  //   .array()
  //   .refine((file) => !!file, {
  //     message: "File can't be bigger than 5MB.",
  //   })
  //   .refine(
  //     (file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
  //     {
  //       message: 'File format must be either jpg, jpeg lub png.',
  //     }
  //   ),
  images: z.any().array(),
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
  featured: z.string().optional(),
})
export const SubCategoryFormSchema = z.object({
  name: z
    .string({
      required_error: 'Sub Category name is required.',
      invalid_type_error: 'Sub Category name must be a string.',
    })
    .min(2, {
      message: 'Sub Category name must be at least 2 characters long.',
    }),
  name_fa: z
    .string({
      required_error: 'Sub Category name is required.',
      invalid_type_error: 'Sub Category name must be a string.',
    })
    .min(2, {
      message: 'Sub Category name must be at least 2 characters long.',
    })
    .max(50, { message: 'Sub Category name cannot exceed 50 characters.' })
    .regex(/^[a-zA-Z0-9\s'&-‌\u0600-\u06FF]+$/, {
      message:
        'Only letters, numbers, and spaces are allowed in the sub category name.',
    })
    .optional(),
  //   image: z
  //     .object({
  //       url: z.string(),
  //     })
  //     .array()
  //     .length(1, 'Choose a sub category image.'),
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
      required_error: 'Sub Category url is required',
      invalid_type_error: 'Sub Category url must be a string',
    })
    .min(2, { message: 'Sub Category url must be at least 2 characters long.' })
    .max(50, { message: 'Sub Category url cannot exceed 50 characters.' })
    .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9\s'&-‌\u0600-\u06FF]+$/, {
      message:
        'Only letters, numbers, hyphen, and underscore are allowed in the sub category url, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.',
    }),
  featured: z.boolean().default(false),
  categoryId: z.string(),
})

export const subCategoryServerFormSchema = z.object({
  name: z
    .string({
      required_error: 'Sub Category name is required.',
      invalid_type_error: 'Sub Category name must be a string.',
    })
    .min(2, {
      message: 'Sub Category name must be at least 2 characters long.',
    })
    .max(50, { message: 'Sub Category name cannot exceed 50 characters.' })
    .regex(/^[a-zA-Z0-9\s'&-‌\u0600-\u06FF]+$/, {
      message:
        'Only letters, numbers, and spaces are allowed in the sub category name.',
    }),
  name_fa: z
    .string({
      required_error: 'Sub Category name is required.',
      invalid_type_error: 'Sub Category name must be a string.',
    })
    .min(2, {
      message: 'Sub Category name must be at least 2 characters long.',
    })
    .max(50, { message: 'Sub Category name cannot exceed 50 characters.' })
    .regex(/^[a-zA-Z0-9\s'&-‌\u0600-\u06FF]+$/, {
      message:
        'Only letters, numbers, and spaces are allowed in the sub category name.',
    })
    .optional(),
  //   image: z
  //     .object({
  //       url: z.string(),
  //     })
  //     .array()
  //     .length(1, 'Choose a sub category image.'),
  // images: zfd
  //   .file()
  //   .array()
  //   .refine((file) => !!file, {
  //     message: "File can't be bigger than 5MB.",
  //   })
  //   .refine(
  //     (file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
  //     {
  //       message: 'File format must be either jpg, jpeg lub png.',
  //     }
  //   ),
  images: z.any().array(),
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
      required_error: 'Sub Category url is required',
      invalid_type_error: 'Sub Category url must be a string',
    })
    .min(2, { message: 'Sub Category url must be at least 2 characters long.' })
    .max(50, { message: 'Sub Category url cannot exceed 50 characters.' })
    .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9\s'&-‌\u0600-\u06FF]+$/, {
      message:
        'Only letters, numbers, hyphen, and underscore are allowed in the sub category url, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.',
    }),
  featured: z.string().optional(),
  categoryId: z.string(),
})

export const StoreFormSchema = z.object({
  name: z
    .string({
      required_error: 'Store name is required',
      invalid_type_error: 'Store name must be a string',
    })
    .min(2, { message: 'Store name must be at least 2 characters long.' })
    .max(50, { message: 'Store name cannot exceed 50 characters.' })
    .regex(/^(?!.*(?:[-_& ]){2,})[a-zA-Z0-9_ &-]+$/, {
      message:
        'Only letters, numbers, space, hyphen, and underscore are allowed in the store name, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.',
    }),
  description: z
    .string({
      required_error: 'Store description is required',
      invalid_type_error: 'Store description must be a string',
    })
    .min(30, {
      message: 'Store description must be at least 30 characters long.',
    })
    .max(500, { message: 'Store description cannot exceed 500 characters.' }),
  name_fa: z
    .string({
      required_error: 'Store name is required',
      invalid_type_error: 'Store name must be a string',
    })
    .min(2, { message: 'Store name must be at least 2 characters long.' })
    .max(50, { message: 'Store name cannot exceed 50 characters.' })
    .regex(/^(?!.*(?:[-_& ]){2,})[a-zA-Z0-9\s'&-‌\u0600-\u06FF_ &-]+$/, {
      message:
        'Only letters, numbers, space, hyphen, and underscore are allowed in the store name, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.',
    }),
  description_fa: z
    .string({
      required_error: 'Store description is required',
      invalid_type_error: 'Store description must be a string',
    })
    .min(30, {
      message: 'Store description must be at least 30 characters long.',
    })
    .max(500, { message: 'Store description cannot exceed 500 characters.' }),
  email: z
    .string({
      required_error: 'Store email is required',
      invalid_type_error: 'Store email must be a string',
    })
    .email({ message: 'Invalid email format.' }),
  phone: z
    .string({
      required_error: 'Store phone number is required',
      invalid_type_error: 'Store phone number must be a string',
    })
    .regex(/^\+?\d+$/, { message: 'Invalid phone number format.' }),
  logo: z.array(imageSchema).optional(),
  // cover: z
  //   .object({ url: z.string() })
  //   .array()
  //   .length(1, 'Choose a cover image.'),
  cover: z.array(imageSchema).optional(),
  // .custom<File[]>()
  // .nullable()
  // .refine((files) => files === null || files.length > 0, {
  //   message: 'At least one image is required',
  // })
  // .refine((files) => files === null || files.length <= 5, {
  //   message: 'Maximum 5 images allowed',
  // }),
  // cover: zfd
  //   .file()
  //   .refine((file) => file.size < 5000000, {
  //     message: "File can't be bigger than 5MB.",
  //   })
  //   .refine(
  //     (file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
  //     {
  //       message: 'File format must be either jpg, jpeg lub png.',
  //     }
  //   )
  //   .array(),
  url: z
    .string({
      required_error: 'Store url is required',
      invalid_type_error: 'Store url must be a string',
    })
    .min(2, { message: 'Store url must be at least 2 characters long.' })
    .max(50, { message: 'Store url cannot exceed 50 characters.' })
    .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_-]+$/, {
      message:
        'Only letters, numbers, hyphen, and underscore are allowed in the store url, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.',
    }),
  featured: z.boolean().default(false).optional(),
  status: z.string().default('PENDING').optional(),
})
