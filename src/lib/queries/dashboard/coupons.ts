import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const getAllStoreCoupons = async (storeUrl: string) => {
  // Retrieve store details from the database using the store URL
  try {
    const store = await prisma.store.findUnique({ where: { url: storeUrl } })
    if (!store) throw new Error('Please provide a valid store URL.')

    const user = await currentUser()

    // Ensure user is authenticated
    if (!user) throw new Error('Unauthenticated.')
    // Retrieve all coupons associated with the store

    // Verify seller permission
    if (user.role !== 'SELLER')
      throw new Error(
        'Unauthorized Access: Seller Privileges Required for Entry.'
      )

    // Ensure storeUrl is provided
    if (!storeUrl) throw new Error('Store URL is required.')

    const coupons = await prisma.coupon.findMany({
      where: {
        storeId: store.id,
      },
      include: {
        store: true,
      },
    })
    // console.log({ coupons })
    return coupons
  } catch (error) {
    console.log(error)
  }
}
