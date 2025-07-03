'use server'

import { auth } from '@/auth'
import { SubCategory } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '../../prisma'

import { deleteFileFromS3, uploadFileToS3 } from '../s3Upload'
import {
  SubCategoryFormSchema,
  subCategoryServerFormSchema,
} from '@/lib/schemas/dashboard'
import { headers } from 'next/headers'

interface CreateSubCategoryFormState {
  success?: string
  errors: {
    name?: string[]
    name_fa?: string[]
    url?: string[]
    featured?: string[]
    categoryId?: string[]
    images?: string[]
    _form?: string[]
  }
}

export async function createSubCategory(
  formData: FormData,
  path: string
): Promise<CreateSubCategoryFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  const result = subCategoryServerFormSchema.safeParse({
    name: formData.get('name'),
    name_fa: formData.get('name_fa'),
    url: formData.get('url'),
    featured: formData.get('featured'),
    categoryId: formData.get('categoryId'),
    images: formData.getAll('images'),
  })

  if (!result.success) {
    console.error(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  //   console.log(result?.data)

  const session = await auth()
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }

  const isCategoryExisted = await prisma.category.findFirst({
    where: {
      id: result.data.categoryId,
    },
  })
  if (!isCategoryExisted) {
    return {
      errors: {
        _form: ['دسته‌بندی حذف شده است!'],
      },
    }
  }

  try {
    const isExisting = await prisma.subCategory.findFirst({
      where: {
        // OR: [{ name: result.data.name }, { url: result.data.url }],
        AND: [
          {
            OR: [
              { name: result.data.name },
              { name_fa: result.data?.name_fa },
              { url: result.data.url },
            ],
          },
          {
            categoryId: result.data.categoryId,
          },
        ],
      },
    })
    if (isExisting) {
      return {
        errors: {
          _form: ['زیردسته‌بندی با این نام موجود است!'],
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
    await prisma.subCategory.create({
      data: {
        name: result.data.name,
        name_fa: result.data?.name_fa,
        url: result.data.url,
        featured,
        categoryId: result.data.categoryId,
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
  redirect(`/${locale}/dashboard/admin/sub-categories`)
}
interface EditSubCategoryFormState {
  errors: {
    name?: string[]
    name_fa?: string[]
    description?: string[]
    categoryId?: string[]
    images?: string[]
    _form?: string[]
  }
}
export async function editSubCategory(
  formData: FormData,
  subCategoryId: string,
  path: string
): Promise<EditSubCategoryFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  const result = SubCategoryFormSchema.safeParse({
    name: formData.get('name'),
    name_fa: formData.get('name_fa'),
    url: formData.get('url'),
    images: formData.getAll('images'),
    featured: Boolean(formData.get('featured')),
    categoryId: formData.get('categoryId'),
  })

  // console.log(result)
  // console.log(formData.getAll('images'))

  if (!result.success) {
    // console.error(result.error.flatten().fieldErrors)
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
  if (!subCategoryId) {
    return {
      errors: {
        _form: ['زیردسته‌بندی در دسترس نیست!'],
      },
    }
  }
  // console.log(result)

  try {
    const isExisting:
      | (SubCategory & {
          images: { id: string; key: string }[] | null
        })
      | null = await prisma.subCategory.findFirst({
      where: { id: subCategoryId },
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
    const isNameExisting = await prisma.subCategory.findFirst({
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
            categoryId: result.data.categoryId,
            NOT: {
              id: subCategoryId,
            },
          },
        ],
      },
    })

    if (isNameExisting) {
      return {
        errors: {
          _form: ['زیردسته‌بندی با این نام موجود است!'],
        },
      }
    }

    // console.log(isExisting)
    // console.log(billboard)
    if (
      typeof result.data.images?.[0] === 'object' &&
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
      await prisma.subCategory.update({
        where: {
          id: subCategoryId,
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
      await prisma.subCategory.update({
        where: {
          id: subCategoryId,
        },
        data: {
          name: result.data.name,
          name_fa: result.data?.name_fa,
          url: result.data.url,
          featured,
          categoryId: result.data.categoryId,

          images: {
            connect: imageIds.map((id) => ({
              id: id,
            })),
          },
        },
      })
    } else {
      await prisma.subCategory.update({
        where: {
          id: subCategoryId,
        },
        data: {
          name: result.data.name,
          name_fa: result.data?.name_fa,
          url: result.data.url,
          featured,
          categoryId: result.data.categoryId,
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
  redirect(`/${locale}/dashboard/admin/sub-categories`)
}

//////////////////////

interface DeleteSubCategoryFormState {
  errors: {
    // name?: string[]
    // featured?: string[]
    // url?: string[]
    images?: string[]

    _form?: string[]
  }
}

export async function deleteSubCategory(
  path: string,
  subCategoryId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formState: DeleteSubCategoryFormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData
): Promise<DeleteSubCategoryFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  // console.log({ path, subCategoryId })
  const session = await auth()
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  // console.log(result)
  if (!subCategoryId) {
    return {
      errors: {
        _form: ['فروشگاه در دسترس نیست!'],
      },
    }
  }

  try {
    const isExisting:
      | (SubCategory & { images: { id: string; key: string }[] | null })
      | null = await prisma.subCategory.findFirst({
      where: { id: subCategoryId },
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
    await prisma.subCategory.delete({
      where: {
        id: subCategoryId,
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
  redirect(`/${locale}/dashboard/admin/sub-categories`)
}
