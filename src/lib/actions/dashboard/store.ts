'use server'

import { auth } from '@/auth'
import { Store } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '../../prisma'

import { deleteFileFromS3, uploadFileToS3 } from '../s3Upload'
import { StoreFormSchema } from '@/lib/schemas/dashboard'
import { headers } from 'next/headers'

interface CreateStoreFormState {
  success?: string
  errors: {
    name?: string[]
    name_fa?: string[]
    description?: string[]
    description_fa?: string[]
    email?: string[]
    phone?: string[]
    url?: string[]
    status?: string[]
    featured?: string[]
    cover?: string[]
    logo?: string[]
    _form?: string[]
  }
}

export async function createStore(
  formData: FormData,
  path: string
): Promise<CreateStoreFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const result = StoreFormSchema.safeParse({
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
    const isExisting = await prisma.store.findFirst({
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
        errorMessage = 'A store with the same name already exists'
      } else if (isExisting.email === result.data.email) {
        errorMessage = 'A store with the same email already exists'
      } else if (isExisting.phone === result.data.phone) {
        errorMessage = 'A store with the same phone number already exists'
      } else if (isExisting.url === result.data.url) {
        errorMessage = 'A store with the same URL already exists'
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
    await prisma.store.create({
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
    // console.log(store)
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
  redirect(`/${locale}/dashboard/seller/stores`)
}
interface EditStoreFormState {
  errors: {
    name?: string[]
    name_fa?: string[]
    description?: string[]
    description_fa?: string[]
    email?: string[]
    phone?: string[]
    url?: string[]
    status?: string[]
    featured?: string[]
    cover?: string[]
    logo?: string[]
    _form?: string[]
  }
}
export async function editStore(
  formData: FormData,
  storeId: string,
  path: string
): Promise<EditStoreFormState> {
  const result = StoreFormSchema.safeParse({
    name: formData.get('name'),
    name_fa: formData.get('name_fa'),
    url: formData.get('url'),
    images: formData.getAll('images'),
    featured: formData.get('featured'),
    storeId: formData.get('storeId'),
  })

  // console.log(result)
  // console.log(formData.getAll('images'))

  if (!result.success) {
    // console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  const session = await auth()
  if (!session || !session.user || session.user.role !== 'SELLER') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  if (!storeId) {
    return {
      errors: {
        _form: ['فروشگاه در دسترس نیست!'],
      },
    }
  }
  // console.log(result)

  try {
    const isExisting:
      | (Store & {
          images: { id: string; key: string }[] | null
        })
      | null = await prisma.store.findFirst({
      where: { id: storeId },
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
    const isNameExisting = await prisma.store.findFirst({
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
            storeId: result.data.storeId,
            NOT: {
              id: storeId,
            },
          },
        ],
      },
    })

    if (isNameExisting) {
      return {
        errors: {
          _form: ['فروشگاه با این نام موجود است!'],
        },
      }
    }

    // console.log(isExisting)
    // console.log(billboard)
    if (
      typeof result.data.images[0] === 'object' &&
      result.data.images[0] instanceof File
    ) {
      const imageIds: string[] = []
      for (const img of result.data.images) {
        const buffer = Buffer.from(await img.arrayBuffer())
        const res = await uploadFileToS3(buffer, img.name)

        if (res?.imageId && typeof res.imageId === 'string') {
          imageIds.push(res.imageId)
        }
      }
      // console.log(res)
      await prisma.store.update({
        where: {
          id: storeId,
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
      await prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          name: result.data.name,
          name_fa: result.data?.name_fa,
          url: result.data.url,
          featured,
          storeId: result.data.storeId,

          images: {
            connect: imageIds.map((id) => ({
              id: id,
            })),
          },
        },
      })
    } else {
      await prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          name: result.data.name,
          name_fa: result.data?.name_fa,
          url: result.data.url,
          featured,
          storeId: result.data.storeId,
        },
      })
    }
    // imageId: res?.imageId,
    // console.log(billboard)
    return Promise.resolve({
      errors: {}, // No errors, operation succeeded
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
  } finally {
    revalidatePath(path)
    redirect(`/dashboard/seller/categories`)
  }
}

//////////////////////

interface DeleteStoreFormState {
  errors: {
    // name?: string[]
    // featured?: string[]
    // url?: string[]
    images?: string[]

    _form?: string[]
  }
}

export async function deleteStore(
  path: string,
  storeId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formState: DeleteStoreFormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData
): Promise<DeleteStoreFormState> {
  // console.log({ path, storeId })
  const session = await auth()
  if (!session || !session.user || session.user.role !== 'SELLER') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  // console.log(result)
  if (!storeId) {
    return {
      errors: {
        _form: ['فروشگاه در دسترس نیست!'],
      },
    }
  }

  try {
    const isExisting:
      | (Store & { images: { id: string; key: string }[] | null })
      | null = await prisma.store.findFirst({
      where: { id: storeId },
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
    await prisma.store.delete({
      where: {
        id: storeId,
      },
    })
    return Promise.resolve({
      errors: {}, // No errors, operation succeeded
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
  } finally {
    revalidatePath(path)
    redirect(`/dashboard/seller/sub-categories`)
  }
}
