import { prisma } from '@/lib/prisma'

export const getAllOfferTags = async (storeId?: string) => {
  const offerTgas = await prisma.offerTag.findMany({
    where: storeId
      ? {
          products: {
            some: {
              storeId: storeId,
            },
          },
        }
      : {},
    include: {
      products: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      products: {
        _count: 'desc', // Order by the count of associated products in descending order
      },
    },
  })
  return offerTgas
}
