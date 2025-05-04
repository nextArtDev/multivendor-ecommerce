'use server'

import { OrderStatus } from '@/app/[locale]/(store)/goshop/types'
import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const updateOrderGroupStatus = async (
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
