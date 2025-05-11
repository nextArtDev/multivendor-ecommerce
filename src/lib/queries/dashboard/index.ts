import { prisma } from '@/lib/prisma'
import { Category, Image, Store, SubCategory } from '@prisma/client'
import { cache } from 'react'

export const getAllCategories = cache(
  async ({
    page = 1,
    pageSize = 100,
  }: {
    page?: number
    pageSize?: number
  }): Promise<{
    categories: (Category & { images: Image[] } & {
      subCategories: (SubCategory & { images: Image[] })[]
    })[]
    isNext: boolean
  }> => {
    const skipAmount = (page - 1) * pageSize
    const [categories, count] = await prisma.$transaction([
      prisma.category.findMany({
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

        skip: skipAmount,
        take: pageSize,

        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.category.count({}),
    ])
    const isNext = count > skipAmount + categories.length
    return { categories, isNext }
  }
)

export const getAllSubCategories = cache(
  async ({
    page = 1,
    pageSize = 100,
  }: {
    page?: number
    pageSize?: number
  }): Promise<{
    subCategories: (SubCategory & { category: Category } & {
      images: Image[]
    })[]
    isNext: boolean
  }> => {
    const skipAmount = (page - 1) * pageSize
    const [subCategories, count] = await prisma.$transaction([
      prisma.subCategory.findMany({
        include: {
          images: true,
          category: true,
        },

        orderBy: {
          createdAt: 'desc',
        },

        skip: skipAmount,
        take: pageSize,
      }),
      prisma.category.count({}),
    ])
    const isNext = count > skipAmount + subCategories.length
    return { subCategories: subCategories, isNext }
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

// export const allCategories = await prisma.category.findMany({})

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
export const getAllCategoriesWillStoreUrl = cache((storeUrl: string) => {
  // Retrieve all subcategories of category from the database
  const subCategories = prisma.category.findMany({
    where: {
      url: storeUrl,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return subCategories
})
