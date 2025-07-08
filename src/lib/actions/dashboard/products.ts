'use server'

import slugify from 'slugify'

import { auth } from '@/auth'
import {
  Color,
  Image,
  Product,
  ProductVariant,
  Size,
  Spec,
  Store,
} from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '../../prisma'

import { deleteFileFromS3, uploadFileToS3 } from '../s3Upload'
import {
  NewProductFormSchema,
  NewServerProductFormSchema,
  ProductEditFormSchema,
  ProductFormSchema,
  VariantFormSchema,
} from '@/lib/schemas/dashboard'
import { headers } from 'next/headers'
import { generateUniqueSlug } from '@/lib/slug-util'

interface CreateProductFormState {
  success?: string
  errors: {
    name?: string[]
    description?: string[]
    variantName?: string[]
    variantDescription?: string[]
    name_fa?: string[]
    description_fa?: string[]
    variantName_fa?: string[]
    variantDescription_fa?: string[]
    images?: string[]
    variantImage?: string[]
    categoryId?: string[]
    subCategoryId?: string[]
    offerTagId?: string[]
    isSale?: string[]
    saleEndDate?: string[]
    brand?: string[]
    sku?: string[]
    weight?: string[]
    colors?: string[]
    sizes?: string[]
    product_specs?: string[]
    variant_specs?: string[]
    keywords?: string[]
    keywords_fa?: string[]
    questions?: string[]

    _form?: string[]
  }
}

export async function createProduct(
  formData: FormData,
  storeUrl: string,
  path: string
): Promise<CreateProductFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const result = ProductFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    variantName: formData.get('variantName'),
    variantDescription: formData.get('variantDescription'),
    name_fa: formData.get('name_fa'),
    description_fa: formData.get('description_fa'),
    variantName_fa: formData.get('variantName_fa'),
    variantDescription_fa: formData.get('variantDescription_fa'),
    categoryId: formData.get('categoryId'),
    subCategoryId: formData.get('subCategoryId'),
    offerTagId: formData.get('offerTagId'),
    isSale: Boolean(formData.get('isSale')),
    saleEndDate: formData.get('saleEndDate'),
    brand: formData.get('brand'),
    sku: formData.get('sku'),
    weight: Number(formData.get('weight')),
    keywords: formData.getAll('keywords'),
    product_specs: formData
      .getAll('product_specs')
      .map((product_spec) => JSON.parse(product_spec.toString())),
    variant_specs: formData
      .getAll('variant_specs')
      .map((variant_spec) => JSON.parse(variant_spec.toString())),
    questions: formData
      .getAll('questions')
      .map((question) => JSON.parse(question.toString())),
    sizes: formData.getAll('sizes').map((size) => JSON.parse(size.toString())),
    colors: formData
      .getAll('colors')
      .map((size) => JSON.parse(size.toString())),
    shippingFeeMethod: formData.get('shippingFeeMethod'),
    freeShippingForAllCountries: Boolean(
      formData.get('freeShippingForAllCountries')
    ),
    images: formData.getAll('images'),
    variantImage: formData.getAll('variantImage'),
  })

  if (!result.success) {
    console.error(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }

  const session = await auth()
  if (
    !session ||
    !session.user ||
    !session.user.id ||
    session.user.role !== 'SELLER'
  ) {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }

  const store = await prisma.store.findUnique({
    where: {
      url: storeUrl,
      userId: session.user.id,
    },
  })
  if (!store) {
    return {
      errors: {
        _form: ['فروشگاه حذف شده است!'],
      },
    }
  }

  try {
    const isExistingProduct = await prisma.product.findFirst({
      where: {
        // OR: [{ name: result.data.name }, { url: result.data.url }],
        AND: [
          {
            // OR: [{ name: result.data.name }, { name_fa: result.data?.name_fa }],
            name: result.data.name,
          },
        ],
      },
    })
    if (isExistingProduct) {
      return {
        errors: {
          _form: ['محصول با این نام موجود است!'],
        },
      }
    }

    const productSlug = await generateUniqueSlug(
      slugify(result.data.name, {
        replacement: '-',
        lower: true,
        trim: true,
      }),
      'product'
    )

    const imagesIds: string[] = []
    for (const img of result.data?.images || []) {
      if (img instanceof File) {
        const buffer = Buffer.from(await img.arrayBuffer())
        const res = await uploadFileToS3(buffer, img.name)

        if (res?.imageId && typeof res.imageId === 'string') {
          imagesIds.push(res.imageId)
        }
      }
    }

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: result.data.categoryId,
        subCategoryId: result.data.subCategoryId,
        name: result.data.name,
        description: result.data.description,
        name_fa: result.data?.name_fa,
        description_fa: result.data?.description_fa,
        slug: productSlug,
        brand: result.data?.brand || '',
        shippingFeeMethod: result.data.shippingFeeMethod,
        // freeShipping:result.data.freeShippingCountriesIds?true:false,
        freeShippingForAllCountries: result.data.freeShippingForAllCountries,
        images: {
          connect: imagesIds.map((id) => ({
            id: id,
          })),
        },
      },
    })

    // Product Specs
    let newProductSpecs
    if (result.data.product_specs) {
      newProductSpecs = result.data.product_specs.map((spec) => ({
        name: spec.name,
        value: spec.value,
        productId: product.id,
      }))
    }

    if (newProductSpecs) {
      await prisma.spec.createMany({
        data: newProductSpecs,
      })
    }

    //  new Question
    let newQuestions
    if (result.data.questions) {
      newQuestions = result.data.questions.map((question) => ({
        question: question.question,
        answer: question.answer,
        productId: product.id,
      }))
    }

    if (newQuestions) {
      await prisma.question.createMany({
        data: newQuestions,
      })
    }

    await createVariant({
      name: result.data.variantName,
      name_fa: result.data.variantName_fa,
      description: result.data.description,
      description_fa: result.data.description_fa,
      saleEndDate: result.data.saleEndDate,
      sku: result.data.sku,
      keywords: result.data.keywords,
      keywords_fa: result.data.keywords_fa,
      weight: result.data.weight,
      isSale: result.data.isSale,
      productId: product.id,
      images: result.data.variantImage,
      sizes: result.data.sizes,
      colors: result.data.colors,
      specs: result.data.variant_specs,
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }
  revalidatePath(path)
  redirect(`/${locale}/dashboard/seller/products`)
}

interface CreateNewProductFormState {
  success?: string
  errors: {
    name?: string[]
    description?: string[]
    variantName?: string[]
    variantDescription?: string[]
    name_fa?: string[]
    description_fa?: string[]
    variantName_fa?: string[]
    variantDescription_fa?: string[]
    images?: string[]
    variantImage?: string[]
    categoryId?: string[]
    subCategoryId?: string[]
    offerTagId?: string[]
    isSale?: string[]
    saleEndDate?: string[]
    brand?: string[]
    sku?: string[]
    weight?: string[]
    colors?: string[]
    sizes?: string[]
    product_specs?: string[]
    variant_specs?: string[]
    keywords?: string[]
    keywords_fa?: string[]
    questions?: string[]

    _form?: string[]
  }
}
export async function createNewProduct(
  formData: FormData,
  storeUrl: string,
  path: string
): Promise<CreateNewProductFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const result = NewServerProductFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),

    name_fa: formData.get('name_fa'),
    description_fa: formData.get('description_fa'),

    categoryId: formData.get('categoryId'),
    subCategoryId: formData.get('subCategoryId'),
    offerTagId: formData.get('offerTagId'),

    brand: formData.get('brand'),
    // sku: formData.get('sku'),
    weight: Number(formData.get('weight')),
    keywords: formData.getAll('keywords'),
    product_specs: formData
      .getAll('product_specs')
      .map((product_spec) => JSON.parse(product_spec.toString())),

    questions: formData
      .getAll('questions')
      .map((question) => JSON.parse(question.toString())),

    shippingFeeMethod: formData.get('shippingFeeMethod'),
    freeShippingForAllCountries: Boolean(
      formData.get('freeShippingForAllCountries')
    ),
    freeShippingCountriesIds: formData.getAll('freeShippingCountriesIds'),
    freeShippingCityIds: formData.getAll('freeShippingCityIds'),
    images: formData.getAll('images'),
  })

  // console.log(formData.getAll('freeShippingCityIds'))
  if (!result.success) {
    console.error(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  console.log(result.data)
  const session = await auth()
  if (
    !session ||
    !session.user ||
    !session.user.id ||
    session.user.role !== 'SELLER'
  ) {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }

  const store = await prisma.store.findUnique({
    where: {
      url: storeUrl,
      userId: session.user.id,
    },
  })
  if (!store) {
    return {
      errors: {
        _form: ['فروشگاه حذف شده است!'],
      },
    }
  }

  try {
    const isExistingProduct = await prisma.product.findFirst({
      where: {
        // OR: [{ name: result.data.name }, { url: result.data.url }],
        AND: [
          {
            // OR: [{ name: result.data.name }, { name_fa: result.data?.name_fa }],
            name: result.data.name,
          },
        ],
      },
    })
    if (isExistingProduct) {
      return {
        errors: {
          _form: ['محصول با این نام موجود است!'],
        },
      }
    }

    const productSlug = await generateUniqueSlug(
      slugify(result.data.name, {
        replacement: '-',
        lower: true,
        trim: true,
      }),
      'product'
    )

    const imagesIds: string[] = []
    for (const img of result.data?.images || []) {
      if (img instanceof File) {
        const buffer = Buffer.from(await img.arrayBuffer())
        const res = await uploadFileToS3(buffer, img.name)

        if (res?.imageId && typeof res.imageId === 'string') {
          imagesIds.push(res.imageId)
        }
      }
    }

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: result.data.categoryId,
        subCategoryId: result.data.subCategoryId,
        name: result.data.name,
        description: result.data.description,
        name_fa: result.data?.name_fa,
        description_fa: result.data?.description_fa,
        slug: productSlug,
        brand: result.data?.brand || '',
        shippingFeeMethod: result.data.shippingFeeMethod,
        // freeShipping:result.data.freeShippingCountriesIds?true:false,
        freeShippingForAllCountries: result.data.freeShippingForAllCountries,
        //   freeShipping: result.data.freeShippingForAllCountries
        //     ? undefined
        //     : (result.data.freeShippingCountriesIds &&
        //         result.data.freeShippingCountriesIds.length > 0) ||
        //       (result.data.freeShippingCityIds &&
        //         result.data.freeShippingCityIds.length > 0)
        //     ? {
        //         create: {
        //           eligibaleCountries:
        //             result.data.freeShippingCountriesIds &&
        //             result.data.freeShippingCountriesIds.length > 0
        //               ? {
        //                   create: result.data.freeShippingCountriesIds.map(
        //                     (country) => ({
        //                       country: { connect: { id: country } },
        //                     })
        //                   ),
        //                 }
        //               : undefined,
        //           eligibleCities:
        //             result.data.freeShippingCityIds &&
        //             result.data.freeShippingCityIds.length > 0
        //               ? {
        //                   create: result.data.freeShippingCityIds.map((city) => ({
        //                     city: { connect: { id: +city } },
        //                   })),
        //                 }
        //               : undefined,
        //         },
        //       }
        //     : undefined,
      },
    })

    const freeShipping = await prisma.freeShipping.create({
      data: {
        productId: product.id,
        eligibleCities: {
          create: result.data.freeShippingCityIds.map((cityId) => ({
            cityId: +cityId,
          })),
        },
      },
      include: {
        eligibleCities: {
          include: {
            city: true,
          },
        },
      },
    })
    // console.log({ freeShipping })
    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        images: {
          connect: imagesIds.map((id) => ({
            id: id,
          })),
        },
      },
    })

    let newSpecs
    if (result.data.product_specs) {
      newSpecs = result.data.product_specs.map((spec) => ({
        name: spec.name,
        value: spec.value,
        productId: product.id,
      }))
    }
    if (newSpecs) {
      await prisma.spec.createMany({
        data: newSpecs,
      })
    }
    let newQuestions
    if (result.data.questions) {
      newQuestions = result.data.questions.map((question) => ({
        question: question.question,
        answer: question.answer,
        productId: product.id,
      }))
    }
    if (newQuestions) {
      await prisma.question.createMany({
        data: newQuestions,
      })
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }
  revalidatePath(path)
  redirect(`/${locale}/dashboard/seller/stores/${storeUrl}/products`)
}
// interface EditProductFormState {
//   errors: {
//     name?: string[]
//     description?: string[]
//     variantName?: string[]
//     variantDescription?: string[]
//     name_fa?: string[]
//     description_fa?: string[]
//     variantName_fa?: string[]
//     variantDescription_fa?: string[]
//     images?: string[]
//     variantImage?: string[]
//     categoryId?: string[]
//     subCategoryId?: string[]
//     offerTagId?: string[]
//     isSale?: string[]
//     saleEndDate?: string[]
//     brand?: string[]
//     sku?: string[]
//     weight?: string[]
//     colors?: string[]
//     sizes?: string[]
//     product_specs?: string[]
//     variant_specs?: string[]
//     keywords?: string[]
//     keywords_fa?: string[]
//     questions?: string[]

//     _form?: string[]
//   }
// }
export async function editProduct(
  formData: FormData,
  productId: string,
  path: string
): Promise<CreateNewProductFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  const result = NewServerProductFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    variantName: formData.get('variantName'),
    variantDescription: formData.get('variantDescription'),
    name_fa: formData.get('name_fa'),
    description_fa: formData.get('description_fa'),
    variantName_fa: formData.get('variantName_fa'),
    variantDescription_fa: formData.get('variantDescription_fa'),
    categoryId: formData.get('categoryId'),
    subCategoryId: formData.get('subCategoryId'),
    offerTagId: formData.get('offerTagId'),
    isSale: Boolean(formData.get('isSale')),
    saleEndDate: formData.get('saleEndDate'),
    brand: formData.get('brand'),
    // sku: formData.get('sku'),
    // weight: Number(formData.get('weight')),
    // keywords: formData.getAll('keywords'),
    product_specs: formData
      .getAll('product_specs')
      .map((product_spec) => JSON.parse(product_spec.toString())),
    // variant_specs: formData
    //   .getAll('variant_specs')
    //   .map((variant_spec) => JSON.parse(variant_spec.toString())),
    questions: formData
      .getAll('questions')
      .map((question) => JSON.parse(question.toString())),
    // freeShippingCountriesIds: formData.getAll('freeShippingCountriesIds'),
    freeShippingCityIds: formData.getAll('freeShippingCityIds'),
    // colors: formData
    //   .getAll('colors')
    //   .map((size) => JSON.parse(size.toString())),
    shippingFeeMethod: formData.get('shippingFeeMethod'),

    freeShippingForAllCountries: Boolean(
      formData.get('freeShippingForAllCountries')
    ),
    images: formData.getAll('images'),
    // variantImage: formData.getAll('variantImage'),
  })
  // console.log(formData.getAll('freeShippingCountriesIds'))

  if (!result.success) {
    console.error(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  const session = await auth()
  if (
    !session ||
    !session.user ||
    !session.user.id ||
    session.user.role !== 'SELLER'
  ) {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  if (!productId) {
    return {
      errors: {
        _form: ['محصول موجود نیست!'],
      },
    }
  }
  // console.log({ result })
  let isExisting:
    | ((Product & {
        images: { id: string; key: string }[] | null
      }) & { store: Store })
    | null
  try {
    isExisting = await prisma.product.findFirst({
      where: { id: productId },
      include: {
        images: { select: { id: true, key: true } },
        store: true,
      },
    })
    if (!isExisting) {
      return {
        errors: {
          _form: ['محصول حذف شده است!'],
        },
      }
    }

    const isNameExisting = await prisma.product.findFirst({
      where: {
        AND: [
          {
            OR: [{ name: result.data.name }],
          },
          {
            NOT: {
              id: productId,
            },
          },
        ],
      },
    })

    if (isNameExisting) {
      return {
        errors: {
          _form: ['محصول با این نام موجود است!'],
        },
      }
    }

    // console.log(isExisting)
    // console.log(billboard)
    if (
      typeof result.data.images?.[0] === 'object' &&
      result.data?.images[0] instanceof File
    ) {
      const imageIds: string[] = []
      for (const img of result.data?.images) {
        if (img instanceof File) {
          const buffer = Buffer.from(await img.arrayBuffer())
          const res = await uploadFileToS3(buffer, img.name)

          if (res?.imageId && typeof res.imageId === 'string') {
            imageIds.push(res.imageId)
          }
        }
      }
      // console.log({imageIds})
      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          images: {
            disconnect: isExisting.images?.map((image: { id: string }) => ({
              id: image.id,
            })),
          },
        },
      })
      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          images: {
            connect: imageIds.map((id) => ({
              id: id,
            })),
          },
        },
      })
    }

    // let eligibaleCountriesDetails
    // let eligibleCitiesDetails

    // if (
    //   result.data.freeShippingCountriesIds &&
    //   result.data.freeShippingCountriesIds.length > 0
    // ) {
    //   eligibaleCountriesDetails = {
    //     eligibaleCountries: {
    //       create: result.data.freeShippingCountriesIds.map((country) => ({
    //         country: { connect: { id: country } },
    //       })),
    //     },
    //   }
    // }
    // if (
    //   result.data.freeShippingCityIds &&
    //   result.data.freeShippingCityIds.length > 0
    // ) {
    //   eligibleCitiesDetails = {
    //     eligibleCities: {
    //       create: result.data.freeShippingCityIds.map((city) => ({
    //         city: { connect: { id: +city } },
    //       })),
    //     },
    //   }
    // }

    const createdProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        categoryId: result.data.categoryId,
        subCategoryId: result.data.subCategoryId,
        name: result.data.name,
        description: result.data.description,
        name_fa: result.data?.name_fa,
        description_fa: result.data?.description_fa,

        brand: result.data?.brand || '',
        shippingFeeMethod: result.data.shippingFeeMethod,
        // freeShipping:result.data.freeShippingCountriesIds?true:false,
        freeShippingForAllCountries: result.data.freeShippingForAllCountries,
        // freeShipping: result.data.freeShippingForAllCountries
        //   ? undefined
        //   : (result.data.freeShippingCountriesIds &&
        //       result.data.freeShippingCountriesIds.length > 0) ||
        //     (result.data.freeShippingCityIds &&
        //       result.data.freeShippingCityIds.length > 0)
        //   ? {
        //       create: {
        //         eligibaleCountries:
        //           result.data.freeShippingCountriesIds &&
        //           result.data.freeShippingCountriesIds.length > 0
        //             ? {
        //                 create: result.data.freeShippingCountriesIds.map(
        //                   (country) => ({
        //                     country: { connect: { id: country } },
        //                   })
        //                 ),
        //               }
        //             : undefined,
        //         eligibleCities:
        //           result.data.freeShippingCityIds &&
        //           result.data.freeShippingCityIds.length > 0
        //             ? {
        //                 create: result.data.freeShippingCityIds.map((city) => ({
        //                   city: { connect: { id: +city } },
        //                 })),
        //               }
        //             : undefined,
        //       },
        //     }
        //   : undefined,
        // freeShipping: {
        //   create: {
        //     // eligibaleCountries: result.data.freeShippingForAllCountries
        //     //   ? undefined
        //     //   : result.data.freeShippingCountriesIds &&
        //     //     result.data.freeShippingCountriesIds.length > 0
        //     //   ? {
        //     //       create: result.data.freeShippingCountriesIds.map(
        //     //         (country) => ({
        //     //           country: { connect: { id: country } },
        //     //         })
        //     //       ),
        //     //     }
        //     //   : undefined,
        //     // eligibleCities:
        //     //   result.data.freeShippingCityIds &&
        //     //   result.data.freeShippingCityIds.length > 0
        //     //     ? {
        //     //         create: result.data.freeShippingCityIds.map((city) => ({
        //     //           city: { connect: { id: +city } },
        //     //         })),
        //     //       }
        //     //     : undefined,
        //     eligibleCities: {
        //       create: result.data.freeShippingCityIds.map((city) => ({
        //         city: { connect: { id: +city } },
        //       })),
        //     },
        //   },
        // },
      },
    })
    // await prisma.freeShipping.create({
    //   data: {
    //     productId,
    //     eligibleCities: {
    //       create: result.data.freeShippingCityIds.map((cityId) => ({
    //         id: +cityId,
    //       })),
    //     },
    //   },
    // })
    // let newEligibleCities
    // if (result.data.freeShippingCityIds) {
    //   newEligibleCities = result.data.freeShippingCityIds.map((id) => ({
    //     productId: productId,
    //     eligibleCities: {
    //       create: result.data.freeShippingCityIds.map((city) => ({
    //         city: { connect: { id: +city } },
    //       })),
    //     },
    //   }))
    // }
    // if (newEligibleCities) {
    //   await prisma.spec.createMany({
    //     data: newEligibleCities,
    //   })
    // }
    console.log(createdProduct)
    console.log(
      result.data.freeShippingCityIds.map((cityId) => ({
        cityId: +cityId,
      }))
    )
    const existingFreeShippingCities = await prisma.freeShipping.findMany({
      where: {
        productId,
      },
      include: {
        eligibleCities: true,
      },
    })
    const existingCityIds = existingFreeShippingCities.map((city) => city.id)

    if (
      !existingCityIds.every(
        (value, index) => value === result.data.freeShippingCityIds[index]
      )
    ) {
    }
    const freeShipping = await prisma.freeShipping.create({
      data: {
        productId: createdProduct.id,
        eligibleCities: {
          create: result.data.freeShippingCityIds.map((cityId) => ({
            cityId: +cityId,
          })),
        },
      },
      include: {
        eligibleCities: {
          include: {
            city: true,
          },
        },
      },
    })
    console.log({ freeShipping })
    let newSpecs
    if (result.data.product_specs) {
      newSpecs = result.data.product_specs.map((spec) => ({
        name: spec.name,
        value: spec.value,
        productId: productId,
      }))
    }
    if (newSpecs) {
      await prisma.spec.createMany({
        data: newSpecs,
      })
    }
    let newQuestions
    if (result.data.questions) {
      newQuestions = result.data.questions.map((question) => ({
        question: question.question,
        answer: question.answer,
        productId: productId,
      }))
    }
    if (newQuestions) {
      await prisma.question.createMany({
        data: newQuestions,
      })
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }
  revalidatePath(path)
  redirect(
    `/${locale}/dashboard/seller/stores/${isExisting.store.url}/products`
  )
}

//////////////////////

interface DeleteProductFormState {
  errors: {
    // name?: string[]
    // featured?: string[]
    // url?: string[]
    images?: string[]

    _form?: string[]
  }
}

export async function deleteProduct(
  path: string,
  productId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formState: DeleteProductFormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData
): Promise<DeleteProductFormState> {
  // console.log({ path, productId })
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  const session = await auth()
  if (!session || !session.user || session.user.role !== 'SELLER') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  // console.log(result)
  if (!productId) {
    return {
      errors: {
        _form: ['فروشگاه در دسترس نیست!'],
      },
    }
  }

  try {
    const isExisting:
      | (Product & {
          variants: (ProductVariant & { variantImage: Image[] })[] | null
        } & {
          images: Image[] | null
        })
      | null = await prisma.product.findFirst({
      where: { id: productId },
      include: {
        images: true,
        variants: {
          include: {
            variantImage: true,
          },
        },
      },
    })
    if (!isExisting) {
      return {
        errors: {
          _form: ['دسته‌بندی حذف شده است!'],
        },
      }
    }

    if (isExisting.images) {
      for (const image of isExisting.images) {
        if (image.key) {
          await deleteFileFromS3(image.key)
        }
      }
    }
    // console.log(isExisting.variants?.flatMap((variant) => variant.images))
    const images = isExisting.variants?.flatMap(
      (variant) => variant.variantImage
    )
    if (images) {
      for (const image of images) {
        if (image.key) {
          await deleteFileFromS3(image.key)
        }
      }
    }
    const variants = isExisting.variants?.flatMap((variant) => variant)

    if (variants) {
      for (const variant of variants) {
        if (variant.id) {
          await prisma.product.update({
            where: { id: productId },
            data: {
              variants: {
                disconnect: {
                  id: variant.id,
                },
              },
            },
          })
          await prisma.productVariant.delete({
            where: {
              id: variant.id,
            },
          })
        }
      }
    }

    // if (isExisting.variants) {
    //   const allDeleetedVariants = await Promise.all(
    //     isExisting.variants?.map(async (variant) => {
    //       await prisma.product.update({
    //         where: { id: productId },
    //         data: {
    //           variants: {
    //             disconnect: {
    //               id: variant.id,
    //             },
    //           },
    //         },
    //       })
    //       console.log(isExisting)
    //       return await prisma.productVariant.delete({
    //         where: { id: variant.id },
    //       })
    //     })
    //   )
    // }

    // const variants = await prisma.productVariant.findMany({
    //   where: { productId },
    // })
    // variants.map(async (variant) => {
    //   await prisma.productVariant.delete({
    //     where: {
    //       id: variant.id,
    //     },
    //   })
    // })

    await prisma.product.delete({
      where: {
        id: isExisting.id,
      },
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }
  revalidatePath(path)
  redirect(
    // `/${locale}/dashboard/seller/stores/${isExisting.store.url}/products/`
    `/${locale}/dashboard/seller/stores/`
  )
}

// Product Variant

interface CreateVariantProps {
  productId: string
  name: string
  variantId?: string
  description: string
  name_fa: string | undefined
  description_fa: string | undefined

  saleEndDate: string | Date | undefined
  sku: string | undefined
  keywords: string[] | undefined
  keywords_fa: string[] | undefined
  weight: number | undefined
  isSale: boolean
  specs:
    | {
        name: string
        value: string
      }[]
    | undefined
  images:
    | string[]
    | File[]
    | {
        url: string
      }[]
    | undefined
  sizes:
    | {
        size: string
        quantity: number
        discount: number
        price: number
      }[]
    | undefined
  colors:
    | {
        color: string
      }[]
    | undefined
}
export const createVariant = async ({
  productId,
  name,
  description,
  name_fa,
  description_fa,
  saleEndDate,
  sku,
  keywords,
  keywords_fa,
  weight,
  isSale,
  specs,
  images,
  sizes,
  colors,
}: CreateVariantProps) => {
  try {
    const variantImageIds: string[] = []
    for (const img of images || []) {
      if (img instanceof File) {
        const buffer = Buffer.from(await img.arrayBuffer())
        const res = await uploadFileToS3(buffer, img.name)

        if (res?.imageId && typeof res.imageId === 'string') {
          variantImageIds.push(res.imageId)
        }
      }
    }
    const imagesIds: string[] = []
    for (const img of images || []) {
      if (img instanceof File) {
        const buffer = Buffer.from(await img.arrayBuffer())
        const res = await uploadFileToS3(buffer, img.name)

        if (res?.imageId && typeof res.imageId === 'string') {
          imagesIds.push(res.imageId)
        }
      }
    }
    const variantSlug = await generateUniqueSlug(
      slugify(name, {
        replacement: '-',
        lower: true,
        trim: true,
      }),
      'productVariant'
    )

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        slug: variantSlug,
        variantName: name,
        variantDescription: description,
        variantName_fa: name_fa,
        variantDescription_fa: description_fa,
        saleEndDate: String(saleEndDate),
        sku: sku ? sku : '',
        keywords: keywords?.length ? keywords?.join(',') : '',
        keywords_fa: keywords_fa?.length ? keywords_fa?.join(',') : '',
        weight: weight ? +weight : 0,
        isSale,
        variantImage: {
          // connect: imagesIds.map((id) => ({
          connect: variantImageIds.map((id) => ({
            id: id,
          })),
        },
      },
    })

    let newVariantSpecs
    if (specs) {
      newVariantSpecs = specs.map((spec) => ({
        name: spec.name,
        value: spec.value,
        variantId: variant.id,
      }))
    }

    if (newVariantSpecs) {
      await prisma.spec.createMany({
        data: newVariantSpecs,
      })
    }

    let newColors
    if (colors) {
      newColors = colors.map((color) => ({
        name: color.color,
        productVariantId: variant.id,
      }))
    }

    if (newColors) {
      await prisma.color.createMany({
        data: newColors,
      })
    }
    //  new Size
    let newSizes
    if (sizes) {
      newSizes = sizes.map((size) => ({
        size: size.size,
        quantity: size.quantity,
        price: size.price,
        discount: size.discount,
        productVariantId: variant.id,
      }))
    }

    if (newSizes) {
      await prisma.size.createMany({
        data: newSizes,
      })
    }
  } catch (error) {
    console.log(error)
  }
}

interface EditVariantFormState {
  success?: string
  errors: {
    name?: string[]
    description?: string[]
    variantName?: string[]
    variantDescription?: string[]

    variantName_fa?: string[]
    variantDescription_fa?: string[]

    variantImage?: string[]

    isSale?: string[]
    saleEndDate?: string[]

    sku?: string[]
    weight?: string[]
    colors?: string[]
    sizes?: string[]
    specs?: string[]
    keywords?: string[]
    keywords_fa?: string[]

    _form?: string[]
  }
}
export async function editVariant(
  formData: FormData,
  variantId: string,
  productId: string,
  path: string
): Promise<EditVariantFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const result = VariantFormSchema.safeParse({
    variantName: formData.get('variantName'),
    variantDescription: formData.get('variantDescription'),

    variantName_fa: formData.get('variantName_fa'),
    variantDescription_fa: formData.get('variantDescription_fa'),

    isSale: Boolean(formData.get('isSale')),
    saleEndDate: formData.get('saleEndDate'),

    sku: formData.get('sku'),
    weight: Number(formData.get('weight')),
    keywords: formData.getAll('keywords'),
    keywords_fa: formData.getAll('keywords_fa'),
    specs: formData.getAll('specs').map((spec) => JSON.parse(spec.toString())),

    sizes: formData.getAll('sizes').map((size) => JSON.parse(size.toString())),
    colors: formData
      .getAll('colors')
      .map((size) => JSON.parse(size.toString())),

    variantImage: formData.getAll('variantImage'),
  })
  if (!result.success) {
    console.error(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  if (!variantId || !productId) {
    return {
      errors: {
        _form: ['محصول حذف شده است!'],
      },
    }
  }
  const session = await auth()
  if (
    !session ||
    !session.user ||
    !session.user.id ||
    session.user.role !== 'SELLER'
  ) {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      store: true,
    },
  })
  if (!product) {
    return {
      errors: {
        _form: ['محصول حذف شده است!'],
      },
    }
  }

  const isExistingVariant:
    | (ProductVariant & { variantImage: Image[] | null } & {
        sizes: Size[] | null
      } & { colors: Color[] | null } & { specs: Spec[] | null })
    | null = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
    },
    include: {
      colors: true,
      sizes: true,
      specs: true,
      variantImage: true,
      wishlist: true,
    },
  })
  try {
    const isVariantNameExisting = await prisma.productVariant.findFirst({
      where: {
        AND: [
          {
            OR: [{ variantName: result.data.variantName }],
          },
          {
            NOT: {
              id: variantId,
            },
          },
        ],
      },
    })

    if (isVariantNameExisting) {
      return {
        errors: {
          _form: ['نوع محصول با این نام موجود است!'],
        },
      }
    }
    // const variantImageIds: string[] = []
    // for (const img of images || []) {
    //   if (img instanceof File) {
    //     const buffer = Buffer.from(await img.arrayBuffer())
    //     const res = await uploadFileToS3(buffer, img.name)

    //     if (res?.imageId && typeof res.imageId === 'string') {
    //       variantImageIds.push(res.imageId)
    //     }
    //   }
    // }
    // if (
    //   typeof result.data.variantImage?.[0] === 'object' &&
    //   result.data.variantImage[0] instanceof File
    // ) {
    //   const imageIds: string[] = []
    //   for (const img of result.data.variantImage) {
    //     if (img instanceof File) {
    //       const buffer = Buffer.from(await img.arrayBuffer())
    //       const res = await uploadFileToS3(buffer, img.name)

    //       if (res?.imageId && typeof res.imageId === 'string') {
    //         imageIds.push(res.imageId)
    //       }
    //     }
    //   }
    //   // console.log(res)
    //   await prisma.productVariant.update({
    //     where: {
    //       id: variantId,
    //     },
    //     data: {
    //       variantImage: {
    //         disconnect: isExistingVariant?.variantImage?.map(
    //           (image: { id: string }) => ({
    //             id: image.id,
    //           })
    //         ),
    //       },
    //     },
    //   })
    //   await prisma.productVariant.update({
    //     where: {
    //       id: variantId,
    //     },
    //     data: {
    //       variantImage: {
    //         connect: imageIds.map((id) => ({
    //           id: id,
    //         })),
    //       },
    //     },
    //   })
    // }
    // OTHER UPDATES
    await prisma.$transaction(async (tx) => {
      const updatedVariant = await tx.productVariant.update({
        where: { id: variantId, productId },
        data: {
          // productId, // usually not changed during variant edit
          // slug: isExistingVariant?.slug, // slug might need careful handling if name changes
          variantName: result.data.variantName,
          variantName_fa: result.data.variantName_fa,
          variantDescription: result.data?.variantDescription || '',
          variantDescription_fa: result.data?.variantDescription_fa || '',
          saleEndDate: String(result.data.saleEndDate), // Ensure this is a string if your schema expects it
          sku: result.data.sku ? result.data.sku : '',
          keywords: result.data.keywords?.length
            ? result.data.keywords?.join(',')
            : '',
          keywords_fa: result.data.keywords_fa?.length
            ? result.data.keywords_fa?.join(',')
            : '',
          weight: result.data.weight ? +result.data.weight : 0,
          isSale: result.data.isSale,
          // Do NOT update variantImage here if you have separate logic for it
        },
      })
      await tx.color.deleteMany({
        where: { productVariantId: variantId },
      })
      await tx.size.deleteMany({
        where: { productVariantId: variantId },
      })
      await tx.spec.deleteMany({
        where: { variantId: variantId },
      })

      // 3. Create new related collections based on submitted data
      if (result.data.colors && result.data.colors.length > 0) {
        const newColorsData = result.data.colors
          .filter((color) => color.color && color.color.trim() !== '') // Filter out empty/invalid colors
          .map((color) => ({
            name: color.color,
            productVariantId: variantId, // Use variantId directly
          }))
        if (newColorsData.length > 0) {
          await tx.color.createMany({
            data: newColorsData,
          })
        }
      }

      if (result.data.sizes && result.data.sizes.length > 0) {
        const newSizesData = result.data.sizes
          .filter((size) => size.size && size.size.trim() !== '') // Filter out empty/invalid sizes
          .map((size) => ({
            size: size.size,
            quantity: size.quantity,
            price: size.price,
            discount: size.discount,
            productVariantId: variantId,
          }))
        if (newSizesData.length > 0) {
          await tx.size.createMany({
            data: newSizesData,
          })
        }
      }

      if (result.data.specs && result.data.specs.length > 0) {
        const newSpecsData = result.data.specs
          .filter(
            (spec) =>
              (spec.name && spec.name.trim() !== '') ||
              (spec.value && spec.value.trim() !== '')
          ) // Filter out empty/invalid specs
          .map((spec) => ({
            name: spec.name,
            value: spec.value,
            variantId: variantId, // Assuming relation name is variantId for Spec model
          }))
        if (newSpecsData.length > 0) {
          await tx.spec.createMany({
            data: newSpecsData,
          })
        }
      }

      // Handle variantImage updates (this seems to be what you attempted)
      // Ensure this logic is correct and doesn't conflict with the main variant update.
      // Your existing image logic:
      if (
        result.data.variantImage &&
        result.data.variantImage.length > 0 &&
        result.data.variantImage[0] instanceof File
      ) {
        const imageIds: string[] = []
        for (const img of result.data.variantImage) {
          if (img instanceof File) {
            const buffer = Buffer.from(await img.arrayBuffer())
            const res = await uploadFileToS3(buffer, img.name) // This is outside the transaction, S3 ops are hard to transact
            if (res?.imageId && typeof res.imageId === 'string') {
              imageIds.push(res.imageId)
            }
          }
        }

        // Disconnect old images
        await tx.productVariant.update({
          where: { id: variantId },
          data: {
            variantImage: {
              set: [], // Disconnects all existing relations
            },
          },
        })
        // Connect new images
        if (imageIds.length > 0) {
          await tx.productVariant.update({
            where: { id: variantId },
            data: {
              variantImage: {
                connect: imageIds.map((id) => ({ id: id })),
              },
            },
          })
        }
      }
      // --- END: Modification for Colors, Sizes, Specs ---
    })
    // const variant = await prisma.productVariant.update({
    //   where: { id: variantId, productId },
    //   data: {
    //     productId,
    //     slug: isExistingVariant?.slug,
    //     variantName: result.data.variantName,
    //     variantDescription: result.data?.variantDescription || '',
    //     variantDescription_fa: result.data?.variantDescription_fa || '',
    //     saleEndDate: String(result.data.saleEndDate),
    //     sku: result.data.sku ? result.data.sku : '',
    //     keywords: result.data.keywords?.length
    //       ? result.data.keywords?.join(',')
    //       : '',
    //     keywords_fa: result.data.keywords_fa?.length
    //       ? result.data.keywords_fa?.join(',')
    //       : '',
    //     weight: result.data.weight ? +result.data.weight : 0,
    //     isSale: result.data.isSale,
    //   },
    // })

    // let newVariantSpecs
    // if (result.data.specs) {
    //   newVariantSpecs = result.data.specs.map((spec) => ({
    //     name: spec.name,
    //     value: spec.value,
    //     variantId: variant.id,
    //   }))
    // }

    // if (newVariantSpecs) {
    //   await prisma.spec.createMany({
    //     data: newVariantSpecs,
    //   })
    // }

    // let newColors
    // if (result.data.colors) {
    //   newColors = result.data.colors.map((color) => ({
    //     name: color.color,
    //     productVariantId: variant.id,
    //   }))
    // }

    // if (newColors) {
    //   await prisma.color.createMany({
    //     data: newColors,
    //   })
    // }
    // //  new Size
    // let newSizes
    // if (result.data.sizes) {
    //   newSizes = result.data.sizes.map((size) => ({
    //     size: size.size,
    //     quantity: size.quantity,
    //     price: size.price,
    //     discount: size.discount,
    //     productVariantId: variant.id,
    //   }))
    // }

    // if (newSizes) {
    //   await prisma.size.createMany({
    //     data: newSizes,
    //   })
    // }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }
  revalidatePath(path)
  redirect(
    `/${locale}/dashboard/seller/stores/${product.store.url}/products/${productId}/variants`
  )
}

// Product Variant

interface CreateNewVariantProps {
  success?: string
  errors: {
    name?: string[]
    description?: string[]
    variantName?: string[]
    variantDescription?: string[]

    variantName_fa?: string[]
    variantDescription_fa?: string[]

    variantImage?: string[]

    isSale?: string[]
    saleEndDate?: string[]

    sku?: string[]
    weight?: string[]
    colors?: string[]
    sizes?: string[]
    specs?: string[]
    keywords?: string[]
    keywords_fa?: string[]

    _form?: string[]
  }
}

export async function createNewVariant(
  formData: FormData,
  productId: string,
  path: string
): Promise<CreateNewVariantProps> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const result = VariantFormSchema.safeParse({
    variantName: formData.get('variantName'),
    variantDescription: formData.get('variantDescription'),

    variantName_fa: formData.get('variantName_fa'),
    variantDescription_fa: formData.get('variantDescription_fa'),

    isSale: Boolean(formData.get('isSale')),
    saleEndDate: formData.get('saleEndDate'),

    sku: formData.get('sku'),
    weight: Number(formData.get('weight')),
    keywords: formData.getAll('keywords'),
    keywords_fa: formData.getAll('keywords_fa'),
    specs: formData.getAll('specs').map((spec) => JSON.parse(spec.toString())),

    sizes: formData.getAll('sizes').map((size) => JSON.parse(size.toString())),
    colors: formData
      .getAll('colors')
      .map((size) => JSON.parse(size.toString())),

    variantImage: formData.getAll('variantImage'),
  })

  if (!result.success) {
    console.error(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  if (!productId) {
    return {
      errors: {
        _form: ['محصول حذف شده است!'],
      },
    }
  }
  const session = await auth()
  if (
    !session ||
    !session.user ||
    !session.user.id ||
    session.user.role !== 'SELLER'
  ) {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  let existingVariantProducts
  try {
    existingVariantProducts = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        variants: true,
        store: true,
      },
    })
    if (!existingVariantProducts) {
      return {
        errors: {
          _form: ['محصول حذف شده است!'],
        },
      }
    }

    // Check for duplicate variant name (case-sensitive)
    const hasDuplicate = existingVariantProducts.variants.some(
      (variant) =>
        variant.variantName.toLowerCase() ===
        result.data.variantName.toLowerCase()
    )

    if (hasDuplicate) {
      return {
        errors: {
          _form: ['این نام واریانت از قبل موجود است!'],
        },
      }
    }
    const variantImageIds: string[] = []
    for (const img of result.data?.variantImage || []) {
      if (img instanceof File) {
        const buffer = Buffer.from(await img.arrayBuffer())
        const res = await uploadFileToS3(buffer, img.name)

        if (res?.imageId && typeof res.imageId === 'string') {
          variantImageIds.push(res.imageId)
        }
      }
    }
    // console.log({ variantImageIds })
    const variantSlug = await generateUniqueSlug(
      slugify(result.data.variantName, {
        replacement: '-',
        lower: true,
        trim: true,
      }),
      'productVariant'
    )

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        slug: variantSlug,
        variantName: result.data.variantName,
        variantDescription: result.data?.variantDescription || '',
        variantDescription_fa: result.data?.variantDescription_fa || '',
        saleEndDate: String(result.data.saleEndDate),
        sku: result.data.sku ? result.data.sku : '',
        keywords: result.data.keywords?.length
          ? result.data.keywords?.join(',')
          : '',
        keywords_fa: result.data.keywords_fa?.length
          ? result.data.keywords_fa?.join(',')
          : '',
        weight: result.data.weight ? +result.data.weight : 0,
        isSale: result.data.isSale,
        variantImage: {
          connect: variantImageIds.map((id) => ({
            id: id,
          })),
        },
      },
    })

    let newVariantSpecs
    if (result.data.specs) {
      newVariantSpecs = result.data.specs.map((spec) => ({
        name: spec.name,
        value: spec.value,
        variantId: variant.id,
      }))
    }

    if (newVariantSpecs) {
      await prisma.spec.createMany({
        data: newVariantSpecs,
      })
    }

    let newColors
    if (result.data.colors) {
      newColors = result.data.colors.map((color) => ({
        name: color.color,
        productVariantId: variant.id,
      }))
    }

    if (newColors) {
      await prisma.color.createMany({
        data: newColors,
      })
    }
    //  new Size
    let newSizes
    if (result.data.sizes) {
      newSizes = result.data.sizes.map((size) => ({
        size: size.size,
        quantity: size.quantity,
        price: size.price,
        discount: size.discount,
        productVariantId: variant.id,
      }))
    }

    if (newSizes) {
      await prisma.size.createMany({
        data: newSizes,
      })
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }
  revalidatePath(path)
  redirect(
    `/${locale}/dashboard/seller/stores/${existingVariantProducts.store.url}/products/${productId}/variants`
  )
}
