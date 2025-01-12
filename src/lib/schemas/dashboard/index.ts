import * as z from 'zod'
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
    z.array(imageObjectSchema),
    z.array(z.string()),
  ])
  .optional()

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
  images: imageSchema,
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

  images: imageSchema,

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

  images: imageSchema,

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

  images: imageSchema,

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
  logo: imageSchema,

  cover: imageSchema,

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
