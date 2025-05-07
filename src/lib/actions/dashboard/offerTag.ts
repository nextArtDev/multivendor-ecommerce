'use server'

import { auth } from '@/auth'
import { OfferTag } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '../../prisma'

import { OfferTagFormSchema } from '@/lib/schemas/dashboard'
import { headers } from 'next/headers'

interface CreateOfferTagFormState {
  errors: {
    name?: string[]
    url?: string[]
    _form?: string[]
  }
}

export async function createOfferTag(
  formData: FormData,
  path: string
): Promise<CreateOfferTagFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  const result = OfferTagFormSchema.safeParse({
    name: formData.get('name'),
    url: formData.get('url'),
  })

  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
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

  try {
    const isExisting = await prisma.offerTag.findFirst({
      where: {
        AND: [
          {
            OR: [{ name: result.data.name }, { url: result.data.url }],
          },
        ],
      },
    })
    if (isExisting) {
      if (isExisting.name === result.data.name) {
        return {
          errors: {
            _form: ['تگ پیشنهادی با این نام موجود است!'],
          },
        }
      } else if (isExisting.url === result.data.url) {
        return {
          errors: {
            _form: ['تگ پیشنهادی با این URL موجود است!'],
          },
        }
      }
    }

    await prisma.offerTag.create({
      data: {
        name: result.data.name,

        url: result.data.url,
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
  redirect(`/${locale}/dashboard/admin/offer-tags`)
}
interface EditOfferTagFormState {
  errors: {
    name?: string[]
    url?: string[]
    _form?: string[]
  }
}
export async function editOfferTag(
  formData: FormData,
  offerTagId: string,
  path: string
): Promise<EditOfferTagFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  const result = OfferTagFormSchema.safeParse({
    name: formData.get('name'),
    url: formData.get('url'),
  })

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
  if (!offerTagId) {
    return {
      errors: {
        _form: ['تگ پیشنهادی در دسترس نیست!'],
      },
    }
  }
  // console.log(result)

  try {
    const isExisting: OfferTag | null = await prisma.offerTag.findFirst({
      where: {
        id: offerTagId,
      },
    })
    if (!isExisting) {
      return {
        errors: {
          _form: ['تگ پیشنهادی حذف شده است!'],
        },
      }
    }

    const isNameExisting = await prisma.offerTag.findFirst({
      where: {
        AND: [
          {
            OR: [{ name: result.data.name }, { url: result.data.url }],
          },
          {
            NOT: {
              id: offerTagId,
            },
          },
        ],
      },
    })

    if (isNameExisting) {
      return {
        errors: {
          _form: ['تگ پیشنهادی با این نام موجود است!'],
        },
      }
    }

    await prisma.offerTag.update({
      where: {
        id: offerTagId,
      },
      data: {
        name: result.data.name,

        url: result.data.url,
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
  redirect(`/${locale}/dashboard/admin/offer-tags`)
}

//////////////////////

interface DeleteOfferTagFormState {
  errors: {
    _form?: string[]
  }
}

export async function deleteOfferTag(
  path: string,
  offerTagId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formState: DeleteOfferTagFormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData
): Promise<DeleteOfferTagFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  // console.log({ path, offerTagId })
  const session = await auth()
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  // console.log(result)
  if (!offerTagId) {
    return {
      errors: {
        _form: ['فروشگاه در دسترس نیست!'],
      },
    }
  }

  try {
    const isExisting: OfferTag | null = await prisma.offerTag.findFirst({
      where: { id: offerTagId },
    })
    if (!isExisting) {
      return {
        errors: {
          _form: ['تگ پیشنهادی حذف شده است!'],
        },
      }
    }

    await prisma.offerTag.delete({
      where: {
        id: offerTagId,
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
  redirect(`/${locale}/dashboard/admin/offer-tags`)
}
