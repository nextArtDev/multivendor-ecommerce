'use server'

import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  Country,
  Image,
  Prisma,
  ProductVariant,
  Size,
  Store,
} from '@prisma/client'
import { FreeShippingWithCountriesType } from '../../types'

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

// getFilteredProducts
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
        url: `/goshop/product/${product.slug}/${variant.slug}`,
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

export const getRelatedProducts = async (
  productId: string,
  categoryId: string,
  subCategoryId: string
) => {
  // Fetch up to 6 products in the given subcategory first
  const subCategoryProducts = await prisma.product.findMany({
    where: {
      subCategoryId: subCategoryId,
      categoryId: categoryId,
      id: {
        not: productId,
      },
    },
    include: {
      images: true,
      variants: {
        include: {
          sizes: true,
          // images: {
          //   orderBy: {
          //     order: 'asc',
          //   },
          // },
          variantImage: true,
          colors: true,
        },
      },
    },
    take: 6, // Limit to 6 products from the subcategory
  })

  // If there are less than 6 products in the subcategory, fetch additional products from the category
  let relatedProducts = subCategoryProducts

  if (relatedProducts.length < 6) {
    // Fetch additional products from the category (excluding those already fetched from the subcategory)
    const remainingCount = 6 - relatedProducts.length
    const categoryProducts = await prisma.product.findMany({
      where: {
        categoryId: categoryId,
        id: {
          notIn: [
            productId, // Exclude the main product
            ...relatedProducts.map((product) => product.id), // Exclude already fetched products
          ],
        },
      },
      take: remainingCount, // Fetch only the remaining number of products
      include: {
        images: true,
        variants: {
          include: {
            sizes: true,
            // images: {
            //   orderBy: {
            //     order: 'asc',
            //   },
            // },
            variantImage: true,
            colors: true,
          },
        },
      },
    })

    // Add the category products to the related products array
    relatedProducts = [...relatedProducts, ...categoryProducts]
  }

  // Transform the products into the required structure for ProductCardType
  const productsWithFilteredVariants = relatedProducts.map((product) => {
    // Filter the variants based on the filters (no filters in this case)
    const filteredVariants = product.variants

    // Transform the filtered variants into the VariantSimplified structure
    const variants: VariantSimplified[] = filteredVariants.map((variant) => ({
      variantId: variant.id,
      variantSlug: variant.slug,
      variantName: variant.variantName,
      images: variant.variantImage,
      sizes: variant.sizes,
    }))

    // Extract variant images for the product
    const variantImages: VariantImageType[] = filteredVariants.map(
      (variant) => ({
        url: `/goshop/product/${product.slug}/${variant.slug}`,
        image: variant.variantImage
          ? variant.variantImage[0]
          : product.images[0],
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

  // Return the related products (up to 6)
  return productsWithFilteredVariants.slice(0, 6)
}

export const getStoreFollowingInfo = async (storeId: string) => {
  const user = await currentUser()
  let isUserFollowingStore = false
  if (user) {
    const storeFollowersInfo = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        followers: {
          where: {
            id: user.id, // Check if this user is following the store
          },
          select: { id: true }, // Select the user id if following
        },
      },
    })
    if (storeFollowersInfo && storeFollowersInfo.followers.length > 0) {
      isUserFollowingStore = true
    }
  }

  const storeFollowersInfo = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      _count: {
        select: {
          followers: true,
        },
      },
    },
  })

  return {
    isUserFollowingStore,
    followersCount: storeFollowersInfo
      ? storeFollowersInfo._count.followers
      : 0,
  }
}

export const getDeliveryDetailsForStoreByCountry = async (
  storeId: string,
  countryId: string
) => {
  // Get shipping rate
  const shippingRate = await prisma.shippingRate.findFirst({
    where: {
      countryId,
      storeId,
    },
  })

  let storeDetails
  if (!shippingRate) {
    storeDetails = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        defaultShippingService: true,
        defaultDeliveryTimeMin: true,
        defaultDeliveryTimeMax: true,
      },
    })
  }

  const shippingService = shippingRate
    ? shippingRate.shippingService
    : storeDetails?.defaultShippingService

  const deliveryTimeMin = shippingRate
    ? shippingRate.deliveryTimeMin
    : storeDetails?.defaultDeliveryTimeMin

  const deliveryTimeMax = shippingRate
    ? shippingRate.deliveryTimeMax
    : storeDetails?.defaultDeliveryTimeMax

  return {
    shippingService,
    deliveryTimeMin,
    deliveryTimeMax,
  }
}

export const getProductShippingFee = async (
  shippingFeeMethod: string,
  userCountry: Country,
  store: Store,
  freeShipping: FreeShippingWithCountriesType | null,
  weight: number,
  quantity: number
) => {
  // Fetch country information based on userCountry.name and userCountry.code
  const country = await prisma.country.findUnique({
    where: {
      name: userCountry.name,
      code: userCountry.code,
    },
  })

  if (country) {
    // Check if the user qualifies for free shipping
    if (freeShipping) {
      const free_shipping_countries = freeShipping.eligibaleCountries
      const isEligableForFreeShipping = free_shipping_countries.some(
        (c) => c.countryId === country.name
      )
      if (isEligableForFreeShipping) {
        return 0 // Free shipping
      }
    }

    // Fetch shipping rate from the database for the given store and country
    const shippingRate = await prisma.shippingRate.findFirst({
      where: {
        countryId: country.id,
        storeId: store.id,
      },
    })

    // Destructure the shippingRate with defaults
    const {
      // extracting the shippingFeePerItem but the default value is store.defaultShippingFeePerItem for that if doesn't exists
      shippingFeePerItem = store.defaultShippingFeePerItem,
      shippingFeeForAdditionalItem = store.defaultShippingFeeForAdditionalItem,
      shippingFeePerKg = store.defaultShippingFeePerKg,
      shippingFeeFixed = store.defaultShippingFeeFixed,
    } = shippingRate || {}

    // Calculate the additional quantity (excluding the first item)
    const additionalItemsQty = quantity - 1

    // Define fee calculation methods in a map (using functions)
    const feeCalculators: Record<string, () => number> = {
      ITEM: () =>
        shippingFeePerItem + shippingFeeForAdditionalItem * additionalItemsQty,
      WEIGHT: () => shippingFeePerKg * weight * quantity,
      FIXED: () => shippingFeeFixed,
    }

    // Check if the fee calculation method exists and calculate the fee
    const calculateFee = feeCalculators[shippingFeeMethod]
    if (calculateFee) {
      return calculateFee() // Execute the corresponding calculation
    }

    // If no valid shipping method is found, return 0
    return 0
  }

  // Return 0 if the country is not found
  return 0
}

export const getProductsByIds = async (
  ids: string[],
  page: number = 1,
  pageSize: number = 10
): Promise<{ products: any; totalPages: number }> => {
  // Check if ids array is empty
  if (!ids || ids.length === 0) {
    throw new Error('Ids are undefined')
  }

  // Default values for page and pageSize
  const currentPage = page
  const limit = pageSize
  const skip = (currentPage - 1) * limit

  try {
    // Query the database for products with the specified ids
    const variants = await prisma.productVariant.findMany({
      where: {
        id: {
          in: ids, // Filter products whose idds are in the provided array
        },
      },
      select: {
        id: true,
        variantName: true,
        slug: true,
        variantImage: {
          select: {
            url: true,
          },
        },
        sizes: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            rating: true,
            sales: true,
            images: true,
          },
        },
      },
      take: limit,
      skip: skip,
    })

    const new_products = variants.map((variant) => ({
      id: variant.product.id,
      slug: variant.product.slug,
      name: variant.product.name,
      rating: variant.product.rating,

      sales: variant.product.sales,
      variants: [
        {
          variantId: variant.id,
          variantName: variant.variantName,
          variantSlug: variant.slug,
          images: variant.variantImage,
          sizes: variant.sizes,
        },
      ],
      variantImages: [],
    }))

    // Return products sorted in the order of ids provided
    const ordered_products = ids
      .map((id) =>
        new_products.find((product) => product.variants[0].variantId === id)
      )
      .filter(Boolean) // Filter out undefined values

    const allProducts = await prisma.productVariant.count({
      where: {
        id: {
          in: ids,
        },
      },
    })

    const totalPages = Math.ceil(allProducts / pageSize)

    return {
      products: ordered_products,
      totalPages,
    }
  } catch (error) {
    throw new Error('Failed to fetch products. Please try again.')
  }
}
