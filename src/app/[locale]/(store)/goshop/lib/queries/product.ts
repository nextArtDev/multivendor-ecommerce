'use server'

import { prisma } from '@/lib/prisma'
import { Image, Prisma, ProductVariant, Size } from '@prisma/client'

export type VariantImageType = {
  url: string
  image: Image
}
export type VariantSimplified = {
  variantId: string
  variantSlug: string
  variantName: string
  images: Image[]
  sizes: Size[]
}
export type SortOrder = 'asc' | 'desc'

export const getProducts = async (
  filters: any = {},
  sortBy = '',
  page: number = 1,
  pageSize: number = 10
) => {
  // Default values for page and pageSize
  const currentPage = page
  const limit = pageSize
  const skip = (currentPage - 1) * limit

  // Construct the base query
  const whereClause: any = {
    AND: [],
  }

  // Apply store filter (using store URL)
  if (filters.store) {
    const store = await prisma.store.findUnique({
      where: {
        url: filters.store,
      },
      select: { id: true },
    })
    if (store) {
      whereClause.AND.push({ storeId: store.id })
    }
  }

  // Exclude product if sent
  if (filters.productId) {
    whereClause.AND.push({
      id: {
        not: filters.productId,
      },
    })
  }

  // Apply category filter (using category URL)
  if (filters.category) {
    const category = await prisma.category.findUnique({
      where: {
        url: filters.category,
      },
      select: { id: true },
    })
    if (category) {
      whereClause.AND.push({ categoryId: category.id })
    }
  }

  // Apply subCategory filter (using subCategory URL)
  if (filters.subCategory) {
    const subCategory = await prisma.subCategory.findUnique({
      where: {
        url: filters.subCategory,
      },
      select: { id: true },
    })
    if (subCategory) {
      whereClause.AND.push({ subCategoryId: subCategory.id })
    }
  }

  // Apply size filter (using array of sizes)
  if (filters.size && Array.isArray(filters.size)) {
    whereClause.AND.push({
      variants: {
        some: {
          sizes: {
            some: {
              size: {
                in: filters.size,
              },
            },
          },
        },
      },
    })
  }

  // Apply Offer filter (using offer URL)
  if (filters.offer) {
    const offer = await prisma.offerTag.findUnique({
      where: {
        url: filters.offer,
      },
      select: { id: true },
    })
    if (offer) {
      whereClause.AND.push({ offerTagId: offer.id })
    }
  }

  // Apply search filter (search term in product name or description)
  if (filters.search) {
    whereClause.AND.push({
      OR: [
        {
          name: { contains: filters.search },
        },
        {
          description: { contains: filters.search },
        },
        {
          variants: {
            some: {
              variantName: { contains: filters.search },
              variantDescription: { contains: filters.search },
            },
          },
        },
      ],
    })
  }

  // Apply price filters (min and max price)
  if (filters.minPrice || filters.maxPrice) {
    whereClause.AND.push({
      variants: {
        some: {
          sizes: {
            some: {
              price: {
                gte: filters.minPrice || 0, // Default to 0 if no min price is set
                lte: filters.maxPrice || Infinity, // Default to Infinity if no max price is set
              },
            },
          },
        },
      },
    })
  }

  if (filters.color && filters.color.length > 0) {
    whereClause.AND.push({
      variants: {
        some: {
          colors: {
            some: {
              name: { in: filters.color },
            },
          },
        },
      },
    })
  }

  // Define the sort order
  let orderBy: Record<string, SortOrder> = {}
  switch (sortBy) {
    case 'most-popular':
      orderBy = { views: 'desc' }
      break
    case 'new-arrivals':
      orderBy = { createdAt: 'desc' }
      break
    case 'top-rated':
      orderBy = { rating: 'desc' }
      break
    default:
      orderBy = { views: 'desc' }
  }

  // Get all filtered, sorted products
  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy,
    take: limit, // Limit to page size
    skip: skip, // Skip the products of previous pages
    include: {
      images: true,

      variants: {
        include: {
          sizes: true,
          variantImage: true,
          //   images: {
          //     orderBy: {
          //       order: 'asc',
          //     },
          //   },
          colors: true,
        },
      },
    },
  })

  type VariantWithSizes = ProductVariant & { sizes: Size[] }

  // Product price sorting
  products.sort((a, b) => {
    // Helper function to get the minimum price from a product's variants
    const getMinPrice = (product: any) =>
      Math.min(
        ...product.variants.flatMap((variant: VariantWithSizes) =>
          variant.sizes.map((size) => {
            const discount = size.discount
            const discountedPrice = size.price * (1 - discount / 100)
            return discountedPrice
          })
        ),
        Infinity // Default to Infinity if no sizes exist
      )

    // Get minimum prices for both products
    const minPriceA = getMinPrice(a)
    const minPriceB = getMinPrice(b)

    // Explicitly check for price sorting conditions
    if (sortBy === 'price-low-to-high') {
      return minPriceA - minPriceB // Ascending order
    } else if (sortBy === 'price-high-to-low') {
      return minPriceB - minPriceA // Descending order
    }

    // If no price sort option is provided, return 0 (no sorting by price)
    return 0
  })

  // Transform the products with filtered variants into ProductCardType structure
  const productsWithFilteredVariants = products.map((product) => {
    // Filter the variants based on the filters
    const filteredVariants = product.variants

    // Transform the filtered variants into the VariantSimplified structure
    const variants: VariantSimplified[] = filteredVariants.map((variant) => ({
      variantId: variant.id,
      variantSlug: variant.slug,
      variantName: variant.variantName,
      images: variant.variantImage,
      sizes: variant.sizes,
      colors: variant.colors,
    }))

    // Extract variant images for the product
    const variantImages: VariantImageType[] = filteredVariants.map(
      (variant) => ({
        url: `/product/${product.slug}/${variant.slug}`,
        image: variant.variantImage
          ? variant.variantImage[0]
          : product.images?.[0],
      })
    )

    // Return the product in the ProductCardType structure
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      rating: product.rating,
      sales: product.sales,
      numReviews: product.numReviews,
      images: product.images,
      variants,
      variantImages,
    }
  })

  /*
  const totalCount = await prisma.product.count({
    where: whereClause,
  });
  */

  const totalCount = products.length

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize)

  // Return the paginated data along with metadata
  return {
    products: productsWithFilteredVariants,
    totalPages,
    currentPage,
    pageSize,
    totalCount,
  }
}

export type ProductType = Prisma.PromiseReturnType<
  typeof getProducts
>['products'][0]
