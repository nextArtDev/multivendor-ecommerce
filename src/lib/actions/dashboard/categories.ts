'use server'

import { auth } from '@/auth'
import { Category } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '../../prisma'

import { deleteFileFromS3, uploadFileToS3 } from '../s3Upload'
import {
  CategoryFormSchema,
  CategoryServerFormSchema,
} from '@/lib/schemas/dashboard'
import { headers } from 'next/headers'
import { getAllCategoriesForCategory } from '@/lib/queries/dashboard'

interface CreateCategoryFormState {
  success?: string
  errors: {
    name?: string[]
    name_fa?: string[]
    url?: string[]
    featured?: string[]
    images?: string[]
    _form?: string[]
  }
}

export async function createCategory(
  formData: FormData,
  path: string
): Promise<CreateCategoryFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const result = CategoryServerFormSchema.safeParse({
    name: formData.get('name'),
    name_fa: formData.get('name_fa'),
    url: formData.get('url'),
    featured: formData.get('featured'),
    images: formData.getAll('images'),
  })

  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  // console.log(result?.data)

  const session = await auth()
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }

  try {
    const isExisting = await prisma.category.findFirst({
      where: {
        OR: [
          { name: result.data.name },
          { name_fa: result.data?.name_fa },
          { url: result.data.url },
        ],
      },
    })
    if (isExisting) {
      return {
        errors: {
          _form: ['دسته‌بندی با این نام موجود است!'],
        },
      }
    }
    // console.log(isExisting)
    // console.log(billboard)
    const featured = result.data.featured === 'true' ? true : false
    const imageIds: string[] = []
    for (const img of result.data?.images || []) {
      if (img instanceof File) {
        const buffer = Buffer.from(await img.arrayBuffer())
        const res = await uploadFileToS3(buffer, img.name)

        if (res?.imageId && typeof res.imageId === 'string') {
          imageIds.push(res.imageId)
        }
      }
    }
    await prisma.category.create({
      data: {
        name: result.data.name,
        name_fa: result.data?.name_fa,
        url: result.data.url,
        featured,
        images: {
          connect: imageIds.map((id) => ({
            id: id,
          })),
        },
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
  redirect(`/${locale}/dashboard/admin/categories`)
}
interface EditCategoryFormState {
  errors: {
    name?: string[]
    name_fa?: string[]
    description?: string[]
    featured?: string[]

    images?: string[]
    _form?: string[]
  }
}
export async function editCategory(
  formData: FormData,

  categoryId: string,
  path: string
): Promise<EditCategoryFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  const result = CategoryFormSchema.safeParse({
    name: formData.get('name'),
    name_fa: formData.get('name_fa'),
    url: formData.get('url'),
    images: formData.getAll('images'),
    featured: Boolean(formData.get('featured')),
  })

  // console.log(formData.getAll('featured'))

  if (!result.success) {
    // console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  const session = await auth()
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  if (!categoryId) {
    return {
      errors: {
        _form: ['دسته‌بندی در دسترس نیست!'],
      },
    }
  }
  // console.log(result)

  try {
    const isExisting:
      | (Category & {
          images: { id: string; key: string }[] | null
        })
      | null = await prisma.category.findFirst({
      where: { id: categoryId },
      include: {
        images: { select: { id: true, key: true } },
      },
    })
    if (!isExisting) {
      return {
        errors: {
          _form: ['دسته‌بندی حذف شده است!'],
        },
      }
    }
    const featured = result.data.featured == true ? true : false
    const isNameExisting = await prisma.category.findFirst({
      where: {
        AND: [
          {
            OR: [
              { name: result.data.name },
              { name_fa: result.data?.name_fa },
              { url: result.data.url },
            ],
          },
          {
            NOT: {
              id: categoryId,
            },
          },
        ],
      },
    })

    if (isNameExisting) {
      return {
        errors: {
          _form: ['دسته‌بندی با این نام موجود است!'],
        },
      }
    }

    // console.log(isExisting)
    // console.log(billboard)
    if (
      typeof result.data?.images?.[0] === 'object' &&
      result.data.images[0] instanceof File
    ) {
      const imageIds: string[] = []
      for (const img of result.data.images) {
        if (img instanceof File) {
          const buffer = Buffer.from(await img.arrayBuffer())
          const res = await uploadFileToS3(buffer, img.name)

          if (res?.imageId && typeof res.imageId === 'string') {
            imageIds.push(res.imageId)
          }
        }
      }
      // console.log(res)
      await prisma.category.update({
        where: {
          id: categoryId,
        },
        data: {
          images: {
            disconnect: isExisting.images?.map((image: { id: string }) => ({
              id: image.id,
            })),
          },
          // billboard: {
          //   disconnect: { id: isExisting.billboard.id },
          // },
        },
      })
      await prisma.category.update({
        where: {
          id: categoryId,
        },
        data: {
          name: result.data.name,
          name_fa: result.data?.name_fa,
          url: result.data.url,
          featured,
          images: {
            connect: imageIds.map((id) => ({
              id: id,
            })),
          },
        },
      })
    } else {
      await prisma.category.update({
        where: {
          id: categoryId,
        },
        data: {
          name: result.data.name,
          name_fa: result.data.name_fa,
          url: result.data.url,
          featured,
        },
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
  redirect(`/${locale}/dashboard/admin/categories`)
}

//////////////////////

interface DeleteBillboardFormState {
  errors: {
    name?: string[]
    featured?: string[]
    url?: string[]
    images?: string[]
    _form?: string[]
  }
}

export async function deleteCategory(
  path: string,
  categoryId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formState: DeleteBillboardFormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData
): Promise<DeleteBillboardFormState> {
  // console.log({ path, categoryId })
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  const session = await auth()
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  // console.log(result)
  if (!categoryId) {
    return {
      errors: {
        _form: ['فروشگاه در دسترس نیست!'],
      },
    }
  }

  try {
    const isExisting:
      | (Category & { images: { id: string; key: string }[] | null })
      | null = await prisma.category.findFirst({
      where: { id: categoryId },
      include: {
        images: { select: { id: true, key: true } },
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
    await prisma.category.delete({
      where: {
        id: categoryId,
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
  redirect(`/${locale}/dashboard/admin/categories`)
}

export const getSubCategoryByCategoryId = async (categoryId: string) => {
  try {
    const subCategories = await getAllCategoriesForCategory(categoryId)
    return subCategories
  } catch (error) {
    console.log(error)
  }
}
