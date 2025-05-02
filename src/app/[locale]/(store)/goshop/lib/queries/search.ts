'use server'

import { prisma } from '@/lib/prisma'

export const getFilteredSizes = async (
  filters: {
    category?: string
    subCategory?: string
    offer?: string
    storeUrl?: string
  },
  take = 10
) => {
  const { category, subCategory, offer, storeUrl } = filters

  let storeId: string | undefined

  if (storeUrl) {
    // Retrieve the storeId based on the storeUrl
    const store = await prisma.store.findUnique({
      where: { url: storeUrl },
    })

    // If no store is found, return an empty array or handle as needed
    if (!store) {
      return { sizes: [], count: 0 }
    }

    storeId = store.id
  }

  // Construct the query dynamically based on the available filters
  const sizes = await prisma.size.findMany({
    where: {
      productVariant: {
        product: {
          AND: [
            category ? { category: { url: category } } : {},
            subCategory ? { subCategory: { url: subCategory } } : {},
            offer ? { category: { url: offer } } : {},
            storeId ? { store: { id: storeId } } : {},
          ],
        },
      },
    },
    select: {
      size: true,
    },
    take,
  })

  // Get Sizes count
  const count = await prisma.size.count({
    where: {
      productVariant: {
        product: {
          AND: [
            category ? { category: { url: category } } : {},
            subCategory ? { category: { url: subCategory } } : {},
            offer ? { category: { url: offer } } : {},
          ],
        },
      },
    },
  })

  // Remove duplicate sizes
  const uniqueSizesArray = Array.from(new Set(sizes.map((size) => size.size)))

  // Define a custom order using a Map for fast lookups
  const sizeOrderMap = new Map(
    ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'].map(
      (size, index) => [size, index]
    )
  )

  // Custom sorting by sizeOrderMap, fallback to alphabetical if not found
  uniqueSizesArray.sort((a, b) => {
    return (
      (sizeOrderMap.get(a) ?? Infinity) - (sizeOrderMap.get(b) ?? Infinity) ||
      a.localeCompare(b)
    )
  })

  // Return the unique sizes in the desired format
  return {
    sizes: uniqueSizesArray.map((size) => ({ size })),
    count,
  }
}
