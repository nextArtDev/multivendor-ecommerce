'use server'

import { prisma } from '@/lib/prisma'
import { Image, Prisma, Review, User } from '@prisma/client'
import { SortOrder } from './product'

export type ReviewsFiltersType = {
  rating?: number
  hasImages?: boolean
}

export type ReviewsOrderType = {
  orderBy: 'latest' | 'oldest' | 'highest'
}
export const getProductFilteredReviews = async (
  productId: string,
  filters: { rating?: number; hasImages?: boolean },
  sort: { orderBy: 'latest' | 'oldest' | 'highest' } | undefined,
  page: number = 1,
  pageSize: number = 4
) => {
  const reviewFilter: any = {
    productId,
  }

  // Apply rating filter if provided
  if (filters.rating) {
    const rating = filters.rating
    reviewFilter.rating = {
      in: [rating, rating + 0.5],
    }
  }

  // Apply image filter if provided
  if (filters.hasImages) {
    reviewFilter.images = {
      some: {},
    }
  }

  // Set sorting order using local SortOrder type
  const sortOption: { createdAt?: SortOrder; rating?: SortOrder } =
    sort && sort.orderBy === 'latest'
      ? { createdAt: 'desc' }
      : sort && sort.orderBy === 'oldest'
      ? { createdAt: 'asc' }
      : { rating: 'desc' }

  // Calculate pagination parameters
  const skip = (page - 1) * pageSize
  const take = pageSize
  // console.log(sort)

  try {
    const statistics = await getRatingStatistics(productId)
    // Fetch reviews from the database
    const reviews = await prisma.review.findMany({
      where: reviewFilter,
      include: {
        images: true,
        user: {
          include: {
            image: true,
          },
        },
      },
      orderBy: sortOption,
      skip, // Skip records for pagination
      take, // Take records for pagination
    })

    return { reviews, statistics }
  } catch (error) {
    console.log(error)
  }
}
export type ProductFilteredReviewType = Prisma.PromiseReturnType<
  typeof getProductFilteredReviews
>
export const getRatingStatistics = async (productId: string) => {
  const ratingStats = await prisma.review.groupBy({
    by: ['rating'],
    where: { productId },
    _count: {
      rating: true,
    },
  })
  const totalReviews = ratingStats.reduce(
    (sum, stat) => sum + stat._count.rating,
    0
  )

  const ratingCounts = Array(5).fill(0)

  ratingStats.forEach((stat) => {
    const rating = Math.floor(stat.rating)
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1] = stat._count.rating
    }
  })

  return {
    ratingStatistics: ratingCounts.map((count, index) => ({
      rating: index + 1,
      numReviews: count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    })),
    reviewsWithImagesCount: await prisma.review.count({
      where: {
        productId,
        images: { some: {} },
      },
    }),
    totalReviews,
  }
}

export type RatingStatisticsType = Prisma.PromiseReturnType<
  typeof getRatingStatistics
>
export type ReviewWithImageType = Review & {
  images: Image[] | null
  // user: User & { image: Image |null}
  user: User
}

export type StatisticsCardType = Prisma.PromiseReturnType<
  typeof getRatingStatistics
>['ratingStatistics']
