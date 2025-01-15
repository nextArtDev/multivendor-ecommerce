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

export const ProductFormSchema = z.object({
  name: z
    .string({
      required_error: 'Product name is mandatory.',
      invalid_type_error: 'Product name must be a valid string.',
    })
    .min(2, { message: 'Product name should be at least 2 characters long.' })
    .max(200, { message: 'Product name cannot exceed 200 characters.' }),
  name_fa: z
    .string({
      required_error: 'Product name is mandatory.',
      invalid_type_error: 'Product name must be a valid string.',
    })
    .min(2, { message: 'Product name should be at least 2 characters long.' })
    .max(200, { message: 'Product name cannot exceed 200 characters.' }),
  /*
    .regex(/^(?!.*(?:[-_ &' ]){2,})[a-zA-Z0-9_ '&-]+$/, {
      message:
        "Product name may only contain letters, numbers, spaces, hyphens, underscores, ampersands, and apostrophes, without consecutive special characters.",
    })
   */ description: z
    .string({
      required_error: 'Product description is mandatory.',
      invalid_type_error: 'Product description must be a valid string.',
    })
    .min(200, {
      message: 'Product description should be at least 200 characters long.',
    }),
  description_fa: z
    .string({
      required_error: 'Product description is mandatory.',
      invalid_type_error: 'Product description must be a valid string.',
    })
    .min(200, {
      message: 'Product description should be at least 200 characters long.',
    }),
  variantName: z
    .string({
      required_error: 'Product variant name is mandatory.',
      invalid_type_error: 'Product variant name must be a valid string.',
    })
    .min(2, {
      message: 'Product variant name should be at least 2 characters long.',
    })
    .max(100, {
      message: 'Product variant name cannot exceed 100 characters.',
    }),
  variantName_fa: z
    .string({
      required_error: 'Product variant name is mandatory.',
      invalid_type_error: 'Product variant name must be a valid string.',
    })
    .min(2, {
      message: 'Product variant name should be at least 2 characters long.',
    })
    .max(100, {
      message: 'Product variant name cannot exceed 100 characters.',
    }),
  /*
    .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_ -]+$/, {
      message:
        "Product variant name may only contain letters, numbers, spaces, hyphens, and underscores, without consecutive special characters.",
    })
     
       */
  variantDescription: z
    .string({
      required_error: 'Product variant description is mandatory.',
      invalid_type_error: 'Product variant description must be a valid string.',
    })
    .optional(),
  variantDescription_fa: z
    .string({
      required_error: 'Product variant description is mandatory.',
      invalid_type_error: 'Product variant description must be a valid string.',
    })
    .optional(),
  images: imageSchema,
  // .min(3, 'Please upload at least 3 images for the product.')
  // .max(6, 'You can upload up to 6 images for the product.'),
  variantImage: imageSchema,
  //  z
  //   .object({ url: z.string() })
  //   .array()
  //   .length(1, 'Choose a product variant image.'),
  categoryId: z
    .string({
      required_error: 'Product category ID is mandatory.',
      invalid_type_error: 'Product category ID must be a valid UUID.',
    })
    .uuid(),
  subCategoryId: z
    .string({
      required_error: 'Product sub-category ID is mandatory.',
      invalid_type_error: 'Product sub-category ID must be a valid UUID.',
    })
    .uuid(),
  offerTagId: z
    .string({
      required_error: 'Product offer tag ID is mandatory.',
      invalid_type_error: 'Product offer tag ID must be a valid UUID.',
    })
    .uuid()
    .optional(),
  brand: z
    .string({
      required_error: 'Product brand is mandatory.',
      invalid_type_error: 'Product brand must be a valid string.',
    })
    .min(2, {
      message: 'Product brand should be at least 2 characters long.',
    })
    .max(50, {
      message: 'Product brand cannot exceed 50 characters.',
    }),
  sku: z
    .string({
      required_error: 'Product SKU is mandatory.',
      invalid_type_error: 'Product SKU must be a valid string.',
    })
    .min(6, {
      message: 'Product SKU should be at least 6 characters long.',
    })
    .max(50, {
      message: 'Product SKU cannot exceed 50 characters.',
    }),
  weight: z.number().min(0.01, {
    message: 'Please provide a valid product weight.',
  }),
  keywords: z
    .array(z.string())
    .nonempty('Please at least one item')
    // .string({
    //   required_error: 'Product keywords are mandatory.',
    //   invalid_type_error: 'Keywords must be valid strings.',
    // })
    // .array()
    // .min(5, {
    //   message: 'Please provide at least 5 keywords.',
    // })
    .max(10, {
      message: 'You can provide up to 10 keywords.',
    }),
  keywords_fa: z
    .string({
      required_error: 'Product keywords are mandatory.',
      invalid_type_error: 'Keywords must be valid strings.',
    })
    .array()
    .min(5, {
      message: 'Please provide at least 5 keywords.',
    })
    .max(10, {
      message: 'You can provide up to 10 keywords.',
    })
    .optional(),
  colors: z
    .object({ color: z.string() })
    .array()
    .min(1, 'Please provide at least one color.')
    .refine((colors) => colors.every((c) => c.color.length > 0), {
      message: 'All color inputs must be filled.',
    }),
  sizes: z
    .object({
      size: z.string(),
      quantity: z
        .number()
        .min(1, { message: 'Quantity must be greater than 0.' }),
      price: z.number().min(0.01, { message: 'Price must be greater than 0.' }),
      discount: z.number().min(0).default(0),
    })
    .array()
    .min(1, 'Please provide at least one size.')
    .refine(
      (sizes) =>
        sizes.every((s) => s.size.length > 0 && s.price > 0 && s.quantity > 0),
      {
        message: 'All size inputs must be filled correctly.',
      }
    ),
  product_specs: z
    .object({
      name: z.string(),
      value: z.string(),
    })
    .array()
    .min(1, 'Please provide at least one product spec.')
    .refine(
      (product_specs) =>
        product_specs.every((s) => s.name.length > 0 && s.value.length > 0),
      {
        message: 'All product specs inputs must be filled correctly.',
      }
    ),
  variant_specs: z
    .object({
      name: z.string(),
      value: z.string(),
    })
    .array()
    .min(1, 'Please provide at least one product variant spec.')
    .refine(
      (product_specs) =>
        product_specs.every((s) => s.name.length > 0 && s.value.length > 0),
      {
        message: 'All product variant specs inputs must be filled correctly.',
      }
    ),
  questions: z
    .object({
      question: z.string(),
      answer: z.string(),
    })
    .array()
    .min(1, 'Please provide at least one product question.')
    .refine(
      (questions) =>
        questions.every((q) => q.question.length > 0 && q.answer.length > 0),
      {
        message: 'All product question inputs must be filled correctly.',
      }
    ),
  isSale: z.boolean().default(false),
  saleEndDate: z.string().optional(),
  freeShippingForAllCountries: z.boolean().default(false),
  freeShippingCountriesIds: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      disable: z.boolean().optional(),
    })
  ),
  // .object({
  //   id: z.string().optional(),
  //   label: z.string(),
  //   value: z.string(),
  // })
  // .array()
  // .optional()
  // .refine(
  //   (ids) => ids?.every((item) => item.label && item.value),
  //   'Each country must have a valid name and ID.'
  // )
  // .default([]),
  // shippingFeeMethod: z.nativeEnum(ShippingFeeMethod),
})
