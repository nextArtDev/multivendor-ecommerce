'use server'

import { prisma } from '@/lib/prisma'

export const retrieveProductDetailsOptimized = async (productSlug: string) => {
  console.log('productSlug', productSlug)
  // Fetch the product details from the database
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      rating: true,
      numReviews: true,
      description: true,
      specs: true,
      questions: true,
      categoryId: true,
      subCategoryId: true,
      shippingFeeMethod: true,
      freeShippingForAllCountries: true,
      images: true,
      _count: {
        select: {
          reviews: true,
        },
      },
      freeShipping: {
        include: {
          eligibaleCountries: {
            include: {
              country: true,
            },
          },
        },
      },
      variants: {
        select: {
          id: true,
          variantName: true,
          variantImage: true,
          weight: true,
          slug: true,
          sku: true,
          isSale: true,
          saleEndDate: true,
          variantDescription: true,
          keywords: true,
          specs: true,
          //   images: {
          //     select: {
          //       url: true,
          //     },
          //     orderBy: {
          //       order: 'asc',
          //     },
          //   },
          sizes: true,
          colors: {
            select: {
              name: true,
            },
          },
        },
      },
      store: true,
    },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  // Return the structured product details
  return product
}
