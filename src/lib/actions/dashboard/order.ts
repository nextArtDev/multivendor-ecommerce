'use server'

import { OrderStatus, ProductStatus } from '@/app/[locale]/(store)/goshop/types'
import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateOrderGroupStatusFormSchema } from '@/lib/schemas/dashboard'
import { Store } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

interface UpdateOrderGroupStatusFormState {
  errors: {
    status?: string[]

    _form?: string[]
  }
}

export async function updateOrderGroupStatus(
  formData: FormData,
  groupId: string,
  storeId: string,
  path: string
): Promise<UpdateOrderGroupStatusFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const result = UpdateOrderGroupStatusFormSchema.safeParse({
    status: formData.get('status'),
  })
  console.log({ result })
  if (!result.success) {
    console.error(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  const session = await currentUser()
  if (!session || !session.id || session.role !== 'SELLER') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }

  if (!storeId || groupId) {
    return {
      errors: {
        _form: ['فروشگاه در دسترس نیست!'],
      },
    }
  }
  let store: Store | null
  try {
    store = await prisma.store.findUnique({
      where: {
        id: storeId,
        userId: session.id,
      },
    })
    console.log({ store })
    // Verify seller ownership
    if (!store) {
      return {
        errors: {
          _form: ['فروشگاه در دسترس نیست!'],
        },
      }
    }
    const order = await prisma.orderGroup.findUnique({
      where: {
        id: groupId,
        storeId: storeId,
      },
    })
    console.log({ order })
    // Ensure order existence
    if (!order) {
      return {
        errors: {
          _form: ['سفارش پیدا نشد!'],
        },
      }
    }
    const res = await prisma.orderGroup.update({
      where: {
        id: groupId,
      },
      data: {
        status: result.data.status as OrderStatus,
      },
    })
    console.log({ res })
    //  return updatedOrder.status
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
  redirect(`/${locale}/dashboard/seller/stores/${store.url}/orders`)
}
export const updateOrderGroupStatus1 = async (
  storeId: string,
  groupId: string,
  status: OrderStatus
) => {
  // Retrieve current user
  const user = await currentUser()

  // Check if user is authenticated
  if (!user) throw new Error('Unauthenticated.')

  // Verify seller permission
  if (user.role !== 'SELLER')
    throw new Error(
      'Unauthorized Access: Seller Privileges Required for Entry.'
    )

  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
      userId: user.id,
    },
  })

  // Verify seller ownership
  if (!store) {
    throw new Error('Unauthorized Access !')
  }

  // Retrieve the order to be updated
  const order = await prisma.orderGroup.findUnique({
    where: {
      id: groupId,
      storeId: storeId,
    },
  })

  // Ensure order existence
  if (!order) throw new Error('Order not found.')

  // Update the order status
  const updatedOrder = await prisma.orderGroup.update({
    where: {
      id: groupId,
    },
    data: {
      status,
    },
  })

  return updatedOrder.status
}

interface UpdateOrderItemStatusFormState {
  errors: {
    status?: string[]

    _form?: string[]
  }
}

export async function updateOrderItemStatus(
  path: string,
  storeId: string,
  orderItemId: string,

  formState: UpdateOrderItemStatusFormState,

  formData: FormData
): Promise<UpdateOrderItemStatusFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const result = UpdateOrderGroupStatusFormSchema.safeParse({
    status: formData.get('status'),
  })

  if (!result.success) {
    console.error(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  console.log({ result })
  const session = await currentUser()

  console.log({ session })
  // if (!session || !session.id || session.role !== 'SELLER') {
  //   return {
  //     errors: {
  //       _form: ['شما اجازه دسترسی ندارید!'],
  //     },
  //   }
  // }

  if (!storeId || orderItemId) {
    return {
      errors: {
        _form: ['فروشگاه در دسترس نیست!'],
      },
    }
  }
  let store
  try {
    store = await prisma.store.findUnique({
      where: {
        id: storeId,
        userId: session.id,
      },
    })
    const product = await prisma.orderItem.findUnique({
      where: {
        id: orderItemId,
      },
    })
    console.log({ product })
    // Verify seller ownership
    if (!product) {
      return {
        errors: {
          _form: ['محصول در دسترس نیست!'],
        },
      }
    }

    const res = await prisma.orderItem.update({
      where: {
        id: orderItemId,
      },
      data: {
        status: result.data.status as ProductStatus,
      },
    })
    console.log({ res })
    //  return updatedOrder.status
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
  redirect(`/${locale}/dashboard/seller/stores/${store?.url}/orders`)
}
export const updateOrderItemStatus1 = async (
  storeId: string,
  orderItemId: string,
  status: ProductStatus
) => {
  // Retrieve current user
  const user = await currentUser()

  // Check if user is authenticated
  if (!user) throw new Error('Unauthenticated.')

  // Verify seller permission
  if (user.role !== 'SELLER')
    throw new Error(
      'Unauthorized Access: Seller Privileges Required for Entry.'
    )

  const store = await prisma.store.findUnique({
    where: {
      id: storeId,
      userId: user.id,
    },
  })

  // Verify seller ownership
  if (!store) {
    throw new Error('Unauthorized Access !')
  }

  // Retrieve the product item to be updated
  const product = await prisma.orderItem.findUnique({
    where: {
      id: orderItemId,
    },
  })

  // Ensure order existence
  if (!product) throw new Error('Order item not found.')

  // Update the order status
  const updatedProduct = await prisma.orderItem.update({
    where: {
      id: orderItemId,
    },
    data: {
      status,
    },
  })

  return updatedProduct.status
}
