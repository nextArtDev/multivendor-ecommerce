'use server'

import { prisma } from '@/lib/prisma'
import { SubCategory } from '@prisma/client'

export const getSubcategories = async (
  limit: number | null,
  random: boolean = false
): Promise<SubCategory[]> => {
  // Define SortOrder enum
  enum SortOrder {
    asc = 'asc',
    desc = 'desc',
  }
  try {
    // Define the query options
    const queryOptions = {
      take: limit || undefined, // Use the provided limit or undefined for no limit
      orderBy: random ? { createdAt: SortOrder.desc } : undefined, // Use SortOrder for ordering
    }

    // If random selection is required, use a raw query to randomize
    if (random) {
      const subcategories = await prisma.$queryRaw<SubCategory[]>`
    SELECT * FROM SubCategory
    ORDER BY RAND()
    LIMIT ${limit || 10} 
    `
      return subcategories
    } else {
      // Otherwise, fetch subcategories based on the defined query options
      const subcategories = await prisma.subCategory.findMany(queryOptions)
      return subcategories
    }
  } catch (error) {
    // Log and re-throw any errors
    throw error
  }
}
