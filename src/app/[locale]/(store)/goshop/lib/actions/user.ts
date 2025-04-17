'use server'

import { auth } from '@/auth'
import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ShippingAddress } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

interface FollowStoreFormState {
  //   success?: boolean
  errors?: {
    storeId?: string[]

    _form?: string[]
  }
}

export async function followStore(
  path: string,
  storeId: string,
  formState: FollowStoreFormState,
  formData: FormData
): Promise<FollowStoreFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const session = await auth()
  if (!session || !session.user) {
    redirect(`/${locale}/login`)
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }

  try {
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    })
    if (!store) {
      return {
        errors: {
          _form: ['فروشگاه حذف شده است!'],
        },
      }
    }

    const userData = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })
    if (!userData) {
      return {
        errors: {
          _form: ['کاربر حذف شده است!'],
        },
      }
    }

    const userFollowingStore = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        following: {
          some: {
            id: storeId,
          },
        },
      },
    })

    if (userFollowingStore) {
      // Unfollow the store and return false
      await prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          followers: {
            disconnect: { id: userData.id },
          },
        },
      })

      //   return { success: false }
    } else {
      // Follow the store and return true
      await prisma.store.update({
        where: {
          id: storeId,
        },
        data: {
          followers: {
            connect: {
              id: userData.id,
            },
          },
        },
      })
      //   return { success: true }
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
  } finally {
    revalidatePath(path)
    redirect(path)
  }
}

export const upsertShippingAddress = async (address: ShippingAddress) => {
  try {
    // const headerResponse = await headers()
    // const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
    // Get current user
    const user = await currentUser()

    // Ensure user is authenticated
    if (!user) throw new Error('Unauthenticated.')

    // Ensure address data is provided
    if (!address) throw new Error('Please provide address data.')

    // Handle making the rest of addresses default false when we are adding a new default
    if (address.default) {
      const addressDB = await prisma.shippingAddress.findUnique({
        where: { id: address.id },
      })
      if (addressDB) {
        try {
          await prisma.shippingAddress.updateMany({
            where: {
              userId: user.id,
              default: true,
            },
            data: {
              default: false,
            },
          })
        } catch (error) {
          throw new Error('Could not reset default shipping addresses')
        }
      }
    }

    // Upsert shipping address into the database
    const upsertedAddress = await prisma.shippingAddress.upsert({
      where: {
        id: address.id,
      },
      update: {
        ...address,
        userId: user.id,
      },
      create: {
        ...address,
        userId: user.id as string,
      },
    })

    return upsertedAddress
  } catch (error) {
    // Log and re-throw any errors
    throw error
  }
}
