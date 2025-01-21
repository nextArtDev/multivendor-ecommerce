import { prisma } from '@/lib/prisma'
import { Category, Image, Store, SubCategory } from '@prisma/client'
import { cache } from 'react'

export const getAllCategories = cache(
  (
    storeId?: string
  ): Promise<
    (Category & { images: Image[] } & {
      subCategories: (SubCategory & { images: Image[] })[]
    })[]
  > => {
    const categories = prisma.category.findMany({
      where: {},
      // ? {
      //     products: {
      //       some: {
      //         storeId,
      //       },
      //     },
      //   }
      // : {},

      include: {
        images: true,
        subCategories: {
          include: {
            images: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    })

    return categories
  }
)
export const getCategoryById = cache(
  (id: string): Promise<(Category & { images: Image[] }) | null> => {
    const category = prisma.category.findFirst({
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
export const getAllSubCategories = cache(
  (): Promise<
    (SubCategory & { category: Category } & { images: Image[] })[] | null
  > => {
    const subCategories = prisma.subCategory.findMany({
      include: {
        images: true,
        category: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    })

    return subCategories
  }
)
export const getSubCategoryById = cache(
  (
    id: string
  ): Promise<
    (SubCategory & { category: Category } & { images: Image[] }) | null
  > => {
    const subCategory = prisma.subCategory.findFirst({
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
)
export const getAllStores = cache(
  (): Promise<
    (Store & { cover: Image[] | null } & { logo: Image | null })[] | null
  > => {
    const stores = prisma.store.findMany({
      include: {
        cover: true,
        logo: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    })

    return stores
  }
)
export const getStoreById = cache(
  (
    id: string
  ): Promise<
    (Store & { cover: Image[] | null } & { logo: Image | null }) | null
  > => {
    const store = prisma.store.findFirst({
      where: {
        id,
      },
      include: {
        cover: true,
        logo: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    })

    return store
  }
)

export const getAllCategoriesForCategory = cache((categoryId: string) => {
  // Retrieve all subcategories of category from the database
  const subCategories = prisma.subCategory.findMany({
    where: {
      categoryId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return subCategories
})
