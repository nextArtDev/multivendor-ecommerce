'use server'
import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const getOrder = async (orderId: string) => {
  // Retrieve current user
  const user = await currentUser()

  // Check if user is authenticated
  if (!user) throw new Error('Unauthenticated.')

  // Get order details, with groups, poroduct items, and ordered by total price
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
      userId: user.id,
    },
    include: {
      groups: {
        include: {
          items: true,
          store: {
            include: {
              logo: true,
            },
          },
          coupon: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          total: 'desc',
        },
      },
      shippingAddress: {
        include: {
          country: true,
          user: true,
          city: true,
          province: true,
        },
      },
      paymentDetails: true,
    },
  })

  return order
}
