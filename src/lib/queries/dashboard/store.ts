import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const getStoreOrders = async (storeUrl: string) => {
  try {
    const user = await currentUser()

    // Check if user is authenticated
    if (!user) throw new Error('Unauthenticated.')

    // Verify seller permission
    if (user.role !== 'SELLER')
      throw new Error(
        'Unauthorized Access: Seller Privileges Required for Entry.'
      )

    // Get store id using url
    const store = await prisma.store.findUnique({
      where: {
        url: storeUrl,
      },
    })

    // Ensure store existence
    if (!store) throw new Error('Store not found.')

    // Verify ownership
    if (user.id !== store.userId) {
      throw new Error("You don't have persmission to access this store.")
    }

    // Retrieve order groups for the specified store and user
    const orders = await prisma.orderGroup.findMany({
      where: {
        storeId: store.id,
      },
      include: {
        items: true,
        coupon: true,
        order: {
          select: {
            paymentStatus: true,

            shippingAddress: {
              include: {
                country: true,
                city: true,
                province: true,
                user: {
                  select: {
                    phone: true,
                  },
                },
              },
            },
            paymentDetails: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return orders
  } catch (error) {
    throw error
  }
}
