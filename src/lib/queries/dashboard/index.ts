import { prisma } from '@/lib/prisma'
import { Category, Image, SubCategory } from '@prisma/client'
import { cache } from 'react'

export const getAllCategories = cache(
  (): Promise<(Category & { images: Image[] })[] | null> => {
    const categories = prisma.category.findMany({
      include: {
        images: true,
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

// export const upsertCategory = async (
//   category: Category & { images: Image[] | null }
// ) => {
//   try {
//     // Get current user
//     const user = await currentUser()

//     // Ensure user is authenticated
//     if (!user) throw new Error('Unauthenticated.')

//     // Verify admin permission
//     if (user.role !== 'ADMIN')
//       throw new Error(
//         'Unauthorized Access: Admin Privileges Required for Entry.'
//       )

//     // Ensure category data is provided
//     if (!category) throw new Error('Please provide category data.')

//     // Throw error if category with same name or URL already exists
//     const existingCategory = await prisma.category.findFirst({
//       where: {
//         AND: [
//           {
//             OR: [{ name: category.name }, { url: category.url }],
//           },
//           {
//             NOT: {
//               id: category.id,
//             },
//           },
//         ],
//       },
//     })

//     // Throw error if category with same name or URL already exists
//     if (existingCategory) {
//       let errorMessage = ''
//       if (existingCategory.name === category.name) {
//         errorMessage = 'A category with the same name already exists'
//       } else if (existingCategory.url === category.url) {
//         errorMessage = 'A category with the same URL already exists'
//       }
//       throw new Error(errorMessage)
//     }

//     // Upsert category into the database
//     const categoryDetails = await prisma.category.upsert({
//       where: {
//         id: category.id,
//       },
//       update: {
//         category,
//         images: {
//           connect: { images: '' },
//         },
//       },
//       create: {
//         category,
//         images: {
//           connect: { images: '' },
//         },
//       },
//     })
//     return categoryDetails
//   } catch (error) {
//     // Log and re-throw any errors
//     throw error
//   }
// }
