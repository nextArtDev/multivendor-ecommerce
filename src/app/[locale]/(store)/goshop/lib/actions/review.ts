'use server'

import { auth } from '@/auth'
import { Image, Review, Store } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { deleteFileFromS3, uploadFileToS3 } from '@/lib/actions/s3Upload'
import { currentUser } from '@/lib/auth'
import { AddReviewSchema } from '../schemas/review'

export type ReviewDetailsType = {
  id: string
  review: string
  rating: number
  images: Image[]
  size: string
  quantity: string
  variant: string
  variantImage: Image[]
  color: string
}

interface CreateReviewFormState {
  success?: string
  errors: {
    review?: string[]
    rating?: string[]
    images?: string[]
    size?: string[]
    quantity?: string[]
    variant?: string[]
    variantImage?: string[]
    color?: string[]

    _form?: string[]
  }
}

export async function createReview(
  formData: FormData,
  productId: string,
  path: string
): Promise<CreateReviewFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const result = AddReviewSchema.safeParse({
    review: formData.get('review'),
    variantName: formData.get('variantName'),
    variantImage: formData.get('variantImage'),
    rating: Number(formData.get('rating')),
    variant: formData.get('variant'),
    color: formData.get('color'),
    size: formData.get('size'),
    quantity: formData.get('quantity'),
    images: formData.getAll('images'),
  })

  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  // console.log(result.data)
  if (!productId) {
    return {
      errors: {
        _form: ['محصول مورد نظر حذف شده است!'],
      },
    }
  }
  const user = await currentUser()
  if (!user || !user.id) {
    redirect('/login')
    return {
      errors: {
        _form: ['لطفا به حساب کاربری خود وارد شوید!'],
      },
    }
  }

  try {
    const isExisting = await prisma.review.findFirst({
      where: {
        productId,
        userId: user.id,
        variant: result.data.variantName,
      },
    })
    // console.log({ isExisting })
    if (isExisting) {
      return {
        errors: {
          _form: ['شما قبلا نظر خود راجع به این محصول را ثبت کرده‌اید!'],
        },
      }
    }

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

    await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        variant: result.data.variantName,

        review: result.data.review,
        rating: +result.data.rating,
        color: result.data.color,
        size: result.data.size,
        quantity: result.data.quantity,
        images: {
          connect: imageIds.map((id) => ({
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
  redirect(`/${locale}/${path}`)
}
interface EditReviewFormState {
  errors: {
    review?: string[]
    rating?: string[]
    images?: string[]
    size?: string[]
    quantity?: string[]
    variant?: string[]
    variantImage?: string[]
    color?: string[]

    _form?: string[]
  }
}
export async function editStore(
  formData: FormData,
  reviewId: string,
  path: string
): Promise<EditReviewFormState> {
  const result = AddReviewSchema.safeParse({
    review: formData.get('review'),
    rating: formData.get('rating'),
    variant: formData.get('variant'),
    color: formData.get('color'),
    size: formData.get('size'),
    quantity: formData.get('quantity'),
    images: formData.getAll('images'),
  })

  // console.log(result)
  // console.log(formData.getAll('images'))

  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  if (!reviewId) {
    return {
      errors: {
        _form: ['نظر مورد نظر حذف شده است!'],
      },
    }
  }
  const user = await currentUser()
  if (!user || !user.id) {
    redirect('/login')
    return {
      errors: {
        _form: ['لطفا به حساب کاربری خود وارد شوید!'],
      },
    }
  }
  // console.log(result)

  try {
    const isExisting = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: user.id,
        variant: result.data.variantName,
      },
    })
    // console.log({ isExisting })
    if (isExisting) {
      return {
        errors: {
          _form: ['شما قبلا نظر خود راجع به این محصول را ثبت کرده‌اید!'],
        },
      }
    }
    const isNameExisting = await prisma.store.findFirst({
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
              id: storeId,
            },
          },
        ],
      },
    })

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
      await prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          cover: {
            disconnect: isExisting.cover?.map((image: { id: string }) => ({
              id: image.id,
            })),
          },
        },
      })
      await prisma.store.update({
        where: {
          id: storeId,
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

    await prisma.store.update({
      where: {
        id: storeId,
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
  redirect(`/dashboard/seller/stores/${result.data.url}/settings`)
}

//////////////////////

interface DeleteReviewFormState {
  errors: {
    // name?: string[]
    // featured?: string[]
    // url?: string[]
    images?: string[]

    _form?: string[]
  }
}

export async function deleteReview(
  path: string,
  reviewId: string,
  productId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formState: DeleteReviewFormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData
): Promise<DeleteReviewFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const user = await currentUser()
  if (!user || !user.id) {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  // console.log(result)
  if (!reviewId) {
    return {
      errors: {
        _form: ['فروشگاه در دسترس نیست!'],
      },
    }
  }

  try {
    const isUsersReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: user.id,
      },
    })
    if (!isUsersReview) {
      return {
        errors: {
          _form: ['شما مجاز به تغییر نظر دیگران نیستید!'],
        },
      }
    }
    const isExisting:
      | (Review & {
          images: { id: string; key: string }[] | null
        })
      | null = await prisma.review.findFirst({
      where: { id: reviewId, userId: user.id, productId },
      include: {
        images: { select: { id: true, key: true } },
      },
    })
    if (!isExisting) {
      return {
        errors: {
          _form: ['نظر حذف شده است!'],
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

    await prisma.review.delete({
      where: {
        id: reviewId,
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
  redirect(`${locale}/goshop/product/${productId}`)
}
