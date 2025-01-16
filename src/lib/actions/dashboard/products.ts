'use server'

import { auth } from '@/auth'
import { Image, Product, ProductVariant } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '../../prisma'

import { deleteFileFromS3, uploadFileToS3 } from '../s3Upload'
import { ProductFormSchema } from '@/lib/schemas/dashboard'
import { headers } from 'next/headers'

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
  path: string
): Promise<CreateProductFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

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

  try {
    const isExisting = await prisma.product.findFirst({
      where: {
        // OR: [{ name: result.data.name }, { url: result.data.url }],
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
        ],
      },
    })
    // console.log({ isExisting })
    if (isExisting) {
      let errorMessage = ''
      if (isExisting.name === result.data.name) {
        errorMessage = 'A product with the same name already exists'
      } else if (isExisting.email === result.data.email) {
        errorMessage = 'A product with the same email already exists'
      } else if (isExisting.phone === result.data.phone) {
        errorMessage = 'A product with the same phone number already exists'
      } else if (isExisting.url === result.data.url) {
        errorMessage = 'A product with the same URL already exists'
      }
      return {
        errors: {
          _form: [errorMessage],
        },
      }
    }
    // if (isExisting) {
    //   return {
    //     errors: {
    //       _form: ['فروشگاه شما موجود است!'],
    //     },
    //   }
    // }
    // console.log(isExisting)
    // console.log(billboard)
    const featured = result.data.featured == true ? true : false
    const coverIds: string[] = []
    for (const img of result.data?.cover || []) {
      if (img instanceof File) {
        const buffer = Buffer.from(await img.arrayBuffer())
        const res = await uploadFileToS3(buffer, img.name)

        if (res?.imageId && typeof res.imageId === 'string') {
          coverIds.push(res.imageId)
        }
      }
    }
    const logoIds: string[] = []
    for (const img of result.data?.logo || []) {
      if (img instanceof File) {
        const buffer = Buffer.from(await img.arrayBuffer())
        const res = await uploadFileToS3(buffer, img.name)

        if (res?.imageId && typeof res.imageId === 'string') {
          logoIds.push(res.imageId)
        }
      }
    }
    await prisma.product.create({
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
        logo: {
          connect: logoIds.map((id) => ({
            id: id,
          }))[0],
        },
        cover: {
          connect: coverIds.map((id) => ({
            id: id,
          })),
        },
      },
    })

    // console.log(res?.imageUrl)
    // console.log(product)
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
