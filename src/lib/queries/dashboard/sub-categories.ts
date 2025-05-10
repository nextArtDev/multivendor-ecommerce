'use server'

import { prisma } from '@/lib/prisma'
import { Category, Image, SubCategory } from '@prisma/client'

export const getSubCategoryById = async (
  id: string
): Promise<
  (SubCategory & { category: Category } & { images: Image[] }) | null
> => {
  const subCategory = await prisma.subCategory.findFirst({
    where: {
      id,
    },
    include: {
      images: true,
      category: true,
    },

    orderBy: {
      createdAt: 'desc',
    },
  })

  return subCategory
}
