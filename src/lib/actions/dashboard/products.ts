'use server'

import slugify from 'slugify'

import { auth } from '@/auth'
import {
  Color,
  Image,
  Product,
  ProductVariant,
  Question,
  Size,
  Spec,
} from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '../../prisma'

import { deleteFileFromS3, uploadFileToS3 } from '../s3Upload'
import { ProductFormSchema } from '@/lib/schemas/dashboard'
import { headers } from 'next/headers'
import { generateUniqueSlug } from '@/lib/dashborad-utils'

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
  storeUrl,
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
  console.log(result?.data)

  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
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
    // const isExistingProduct = await prisma.product.findFirst({
    //   where: {
    //     // OR: [{ name: result.data.name }, { url: result.data.url }],
    //     AND: [
    //       {
    //         OR: [{ name: result.data.name }, { name_fa: result.data?.name_fa }],
    //       },
    //     ],
    //   },
    // })
    // if (isExistingProduct) {
    //   return {
    //     errors: {
    //       _form: ['محصول با این نام موجود است!'],
    //     },
    //   }
    // }
    // const isExistingVariant = await prisma.product.findFirst({
    //   where: {
    //     // OR: [{ name: result.data.name }, { url: result.data.url }],
    //     AND: [
    //       {
    //         OR: [
    //           { name: result.data.name },
    //           { name_fa: result.data?.name_fa },
    //           { email: result.data.email },
    //           { phone: result.data.phone },
    //           { url: result.data.url },
    //         ],
    //       },
    //     ],
    //   },
    // })

    // const productSlug = await generateUniqueSlug(
    //   slugify(result.data.name, {
    //     replacement: '-',
    //     lower: true,
    //     trim: true,
    //   }),
    //   'product'
    // )
    // const variantSlug = await generateUniqueSlug(
    //   slugify(result.data.variantName, {
    //     replacement: '-',
    //     lower: true,
    //     trim: true,
    //   }),
    //   'productVariant'
    // )
    //  for (const img of result.data?.logo) {
    //    if (img instanceof File) {
    //      const buffer = Buffer.from(await img.arrayBuffer())
    //      const res = await uploadFileToS3(buffer, img.name)

    //      if (res?.imageId && typeof res.imageId === 'string') {
    //        imageIds.push(res.imageId)
    //      }
    //    }
    //  }

    // Product Specs
    let newProductSpecs
    if (result.data.product_specs) {
      newProductSpecs = result.data.product_specs.map((spec) => ({
        name: spec.name,
        value: spec.value,
      }))
    }
    console.log({ newProductSpecs })
    let productSpecs: Spec[]
    if (newProductSpecs) {
      productSpecs = await prisma.spec.createMany({
        data: newProductSpecs,
      })
    }

    // // Variant Specs
    // let newVariantSpecs
    // if (result.data.variant_specs) {
    //   newVariantSpecs = result.data.variant_specs.map((spec) => ({
    //     name: spec.name,
    //     value: spec.value,
    //   }))
    // }

    // let variantSpecs: Spec[]
    // if (newVariantSpecs) {
    //   variantSpecs =await prisma.spec.createMany({
    //     data: newVariantSpecs,
    //   })
    // }

    // //  new Color
    // let newColors
    // if (result.data.colors) {
    //   newColors = result.data.colors.map((color) => ({
    //     name: color.color,
    //   }))
    // }

    // let colors:Color[]
    // if (newColors) {
    //   colors =await prisma.color.createMany({
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
    //   }))
    // }

    // let sizes:Size[]
    // if (newSizes) {
    //   sizes = await prisma.size.createMany({
    //     data: newSizes,
    //   })
    // }

    // //  new Question
    // let newQuestions
    // if (result.data.questions) {
    //   newQuestions = result.data.questions.map((question) => ({
    //     question: question.question,
    //     answer: question.answer,
    //   }))
    // }

    // let questions:Question[]
    // if (newQuestions) {
    //   questions =await prisma.question.createMany({
    //     data: newQuestions,
    //   })
    // }
    // const imagesIds: string[] = []
    // for (const img of result.data?.images || []) {
    //   if (img instanceof File) {
    //     const buffer = Buffer.from(await img.arrayBuffer())
    //     const res = await uploadFileToS3(buffer, img.name)

    //     if (res?.imageId && typeof res.imageId === 'string') {
    //       imagesIds.push(res.imageId)
    //     }
    //   }
    // }
    // const variantImageIds: string[] = []
    // for (const img of result.data?.variantImage || []) {
    //   if (img instanceof File) {
    //     const buffer = Buffer.from(await img.arrayBuffer())
    //     const res = await uploadFileToS3(buffer, img.name)

    //     if (res?.imageId && typeof res.imageId === 'string') {
    //       variantImageIds.push(res.imageId)
    //     }
    //   }
    // }

    // const Product = await prisma.product.create({
    //   data: {
    //     storeId: store.id,
    //     categoryId: result.data.categoryId,
    //     subCategoryId: result.data.subCategoryId,
    //     name: result.data.name,
    //     description: result.data.description,
    //     name_fa: result.data?.name_fa,
    //     description_fa: result.data?.description_fa,
    //     slug: productSlug,
    //     brand: result.data?.brand || '',
    //     shippingFeeMethod: result.data.shippingFeeMethod,
    //     // freeShipping:result.data.freeShippingCountriesIds?true:false,
    //     freeShippingForAllCountries: result.data.freeShippingForAllCountries,
    //     images: {
    //       connect: imagesIds.map((id) => ({
    //         id: id,
    //       })),
    //     },

    //     specs: {
    //       connect: productSpecs.map((id)=>({id})),
    //     },
    //   },
    // })
    // const featured = result.data.featured == true ? true : false
    // const coverIds: string[] = []
    // for (const img of result.data?.cover || []) {
    //   if (img instanceof File) {
    //     const buffer = Buffer.from(await img.arrayBuffer())
    //     const res = await uploadFileToS3(buffer, img.name)
    //     if (res?.imageId && typeof res.imageId === 'string') {
    //       coverIds.push(res.imageId)
    //     }
    //   }
    // }
    // const logoIds: string[] = []
    // for (const img of result.data?.logo || []) {
    //   if (img instanceof File) {
    //     const buffer = Buffer.from(await img.arrayBuffer())
    //     const res = await uploadFileToS3(buffer, img.name)
    //     if (res?.imageId && typeof res.imageId === 'string') {
    //       logoIds.push(res.imageId)
    //     }
    //   }
    // }
    // await prisma.product.create({
    //   data: {
    //     name: result.data.name,
    //     userId: session.user.id,
    //     name_fa: result.data?.name_fa,
    //     description: result.data.description,
    //     description_fa: result.data?.description_fa,
    //     url: result.data.url,
    //     featured,
    //     phone: result.data.phone,
    //     email: result.data.email,
    //     logo: {
    //       connect: logoIds.map((id) => ({
    //         id: id,
    //       }))[0],
    //     },
    //     cover: {
    //       connect: coverIds.map((id) => ({
    //         id: id,
    //       })),
    //     },
    //   },
    // })
    // // console.log(res?.imageUrl)
    // // console.log(product)
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
  // revalidatePath(path)
  // redirect(`/${locale}/dashboard/seller/products`)
}
interface EditProductFormState {
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
export async function editProduct(
  formData: FormData,
  productId: string,
  path: string
): Promise<EditProductFormState> {
  const result = ProductFormSchema.safeParse({
    name: formData.get('name'),
    name_fa: formData.get('name_fa'),
    description: formData.get('description'),
    description_fa: formData.get('description_fa'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    url: formData.get('url'),
    featured: Boolean(formData.get('featured')),

    logo: formData.getAll('logo'),
    cover: formData.getAll('cover'),
  })

  // console.log(result)
  // console.log(formData.getAll('images'))

  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
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
        _form: ['فروشگاه در دسترس نیست!'],
      },
    }
  }
  // console.log(result)

  try {
    const isExisting:
      | (Product & {
          cover: { id: string; key: string }[] | null
          logo: Image | null
        })
      | null = await prisma.product.findFirst({
      where: { id: productId },
      include: {
        cover: { select: { id: true, key: true } },
        logo: true,
      },
    })
    if (!isExisting) {
      return {
        errors: {
          _form: ['فروشگاه حذف شده است!'],
        },
      }
    }
    const featured = result.data.featured == true ? true : false
    const isNameExisting = await prisma.product.findFirst({
      where: {
        AND: [
          {
            OR: [
              { name: result.data.name },
              { name_fa: result.data?.name_fa },
              { email: result.data.email },
              { phone: result.data.phone },
              { url: result.data.url },
            ],
          },
          {
            NOT: {
              id: productId,
            },
          },
        ],
      },
    })

    // if (isNameExisting) {
    //   return {
    //     errors: {
    //       _form: ['فروشگاه با این نام موجود است!'],
    //     },
    //   }
    // }
    if (isNameExisting) {
      let errorMessage = ''
      if (isNameExisting.name === result.data.name) {
        errorMessage = 'A product with the same name already exists'
      } else if (isNameExisting.email === result.data.email) {
        errorMessage = 'A product with the same email already exists'
      } else if (isNameExisting.phone === result.data.phone) {
        errorMessage = 'A product with the same phone number already exists'
      } else if (isNameExisting.url === result.data.url) {
        errorMessage = 'A product with the same URL already exists'
      }
      return {
        errors: {
          _form: [errorMessage],
        },
      }
    }

    // console.log(isExisting)
    // console.log(billboard)
    if (
      typeof result.data.cover?.[0] === 'object' &&
      result.data?.cover[0] instanceof File
    ) {
      const imageIds: string[] = []
      for (const img of result.data?.cover) {
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
          cover: {
            disconnect: isExisting.cover?.map((image: { id: string }) => ({
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
          cover: {
            connect: imageIds.map((id) => ({
              id: id,
            })),
          },
        },
      })
    }
    if (
      typeof result.data.logo?.[0] === 'object' &&
      result.data?.logo[0] instanceof File
    ) {
      const imageIds: string[] = []
      for (const img of result.data?.logo) {
        if (img instanceof File) {
          const buffer = Buffer.from(await img.arrayBuffer())
          const res = await uploadFileToS3(buffer, img.name)

          if (res?.imageId && typeof res.imageId === 'string') {
            imageIds.push(res.imageId)
          }
        }
      }
      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          logo: {
            disconnect: isExisting.cover?.map((image: { id: string }) => ({
              id: image.id,
            }))[0],
          },
        },
      })

      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          logo: {
            connect: imageIds.map((id) => ({
              id: id,
            }))[0],
          },
        },
      })
    }
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name: result.data.name,
        userId: session.user.id,
        name_fa: result.data?.name_fa,
        description: result.data.description,
        description_fa: result.data?.description_fa,
        url: result.data.url,
        featured,
        phone: result.data.phone,
        email: result.data.email,
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
  redirect(`/dashboard/seller/products/${result.data.url}/settings`)
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
          variants: (ProductVariant & { images: Image[] })[] | null
        })
      | null = await prisma.product.findFirst({
      where: { id: productId },
      include: {
        variants: {
          include: {
            images: true,
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
    // console.log(isExisting.variants?.flatMap((variant) => variant.images))
    const images = isExisting.variants?.flatMap((variant) => variant.images)
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
    console.log(err)
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
  } finally {
    revalidatePath(path)
    redirect(`/dashboard/seller/products`)
  }
}
