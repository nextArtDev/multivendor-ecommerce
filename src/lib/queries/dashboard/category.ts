'use server'

import { prisma } from '@/lib/prisma'

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
