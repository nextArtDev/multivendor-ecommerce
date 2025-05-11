'use server'

import { prisma } from '@/lib/prisma'
import { Category, Image } from '@prisma/client'
import { cache } from 'react'

export const allCategories = async () => {
  try {
    // Retrieve all subcategories of category from the database
    const allCategories = await prisma.category.findMany({})
    // console.log({ allCategories })
    return allCategories
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

export const getCategoryById = cache(
  async (id: string): Promise<(Category & { images: Image[] }) | null> => {
    const category = await prisma.category.findFirst({
      where: {
        id,
      },
      include: {
        images: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    })

    return category
  }
)
