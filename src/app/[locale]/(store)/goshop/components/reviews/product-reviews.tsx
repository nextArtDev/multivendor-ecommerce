'use client'

import { FC, useEffect, useState } from 'react'
// import RatingCard from "../../cards/product-rating";
// import RatingStatisticsCard from "../../cards/rating-statistics";
// import ReviewCard from "../../cards/review";
// import ReviewsFilters from "./filters";
// import ReviewsSort from "./sort";
// import Paginaion from "../../shared/pagination";
// import ReviewDetails from "../../forms/review-details";
// import { getProductFilteredReviews } from "@/queries/product-optimized";
// import ProductPageReviewsSkeletonLoader from "../../skeletons/product-page/reviews";
import { DotLoader } from 'react-spinners'
import { ProductDataType, ProductVariantDataType } from '../../types'
import {
  getProductFilteredReviews,
  RatingStatisticsType,
  ReviewsFiltersType,
  ReviewsOrderType,
  ReviewWithImageType,
} from '../../lib/queries/review'
import ProductPageReviewsSkeletonLoader from '../skeleton/reviews'
import RatingCard from './rating-card'
import ReviewsFilters from './review-filters'
import ReviewsSort from './sort'
import RatingStatisticsCard from './rating-statistics'
import ReviewCard from './review-card'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const defaultData = {
  ratingStatistics: [
    { rating: 1, numReviews: 0, percentage: 0 },
    { rating: 2, numReviews: 0, percentage: 0 },
    { rating: 3, numReviews: 0, percentage: 0 },
    { rating: 4, numReviews: 0, percentage: 0 },
    { rating: 5, numReviews: 0, percentage: 0 },
  ],
  reviewsWithImagesCount: 0,
  totalReviews: 0,
}
interface Props {
  product: ProductDataType
  rating: number
  // variant: Partial<ProductVariantDataType | undefined>
  numReviews: number
}

const ProductReviews: FC<Props> = ({
  product,
  rating,
  // variant,
  numReviews,
}) => {
  // const [loading, setLoading] = useState<boolean>(true)
  // const [filterLoading, setFilterLoading] = useState<boolean>(true)
  // const [data, setData] = useState<ReviewWithImageType[]>([])
  // const [statistics, setStatistics] =
  //   useState<RatingStatisticsType>(defaultData)
  const [averageRating, setAverageRating] = useState<number>(rating)
  const searchParams = useSearchParams()
  // Filtering
  // const filtered_data = {
  //   rating: undefined,
  //   hasImages: undefined,
  // }

  // const filterRate = (await searchParams).rating
  // console.log('ser', sorter, hasImages, page)
  // const [filters, setFilters] = useState<ReviewsFiltersType>(filtered_data)
  const sorter = searchParams.get('sort')
  const hasImages = searchParams.get('hasImages')
  const page = Number(searchParams.get('page'))
  const FilterRating = Number(searchParams.get('rating'))
  console.log(sorter, hasImages, page)
  const sort = { orderBy: sorter as 'latest' | 'oldest' | 'highest' }
  const filters = {
    rating: FilterRating ? +FilterRating : undefined,
    hasImages: hasImages === 'true' ? true : false,
  }
  // // Sorting
  // const [sort, setSort] = useState<ReviewsOrderType>()

  // // Pagination
  // const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(4)

  // useEffect(() => {
  //   if (filters.rating || filters.hasImages || sort) {
  //     setPage(1)
  //     handleGetReviews()
  //   }
  //   if (page) {
  //     handleGetReviews()
  //   }
  // }, [filters, sort, page])

  const { data, isFetching, isPending } = useQuery({
    queryKey: ['product-review', sorter, hasImages, page, FilterRating],
    queryFn: () =>
      getProductFilteredReviews(
        product.id,
        filters,
        sort,
        Number(page ? +page + 1 : 1),
        pageSize
      ),
  })

  console.log({ data })
  if (!data)
    return (
      <>
        <DotLoader color="#f5f5f5" />
      </>
    )
  const half = Math.ceil(data?.reviews?.length / 2)
  // const { reviews, statistics } = data
  // const handleGetReviews = async () => {
  //   try {
  //     setFilterLoading(true)
  //     const res = await getProductFilteredReviews(
  //       product.id,
  //       filters,
  //       sort,
  //       page,
  //       pageSize
  //     )

  //     setData(res?.reviews)
  //     setStatistics(res.statistics)
  //     setLoading(false)
  //     setFilterLoading(false)
  //   } catch (error) {
  //     setLoading(false)
  //   }
  // }

  return (
    <div className="pt-6" id="reviews">
      {isPending ? (
        <ProductPageReviewsSkeletonLoader numReviews={numReviews} />
      ) : (
        <div>
          {/* Title */}
          <div className="h-12">
            <h2 className="text-primary text-2xl font-bold">
              Custom Reviews ({data?.statistics.totalReviews})
            </h2>
          </div>
          {/* Statistics */}
          <div className="w-full">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <RatingCard rating={averageRating} />
              {data?.statistics && (
                <RatingStatisticsCard
                  statistics={data.statistics.ratingStatistics}
                />
              )}
            </div>
          </div>
          <>
            <div className="space-y-6">
              <ReviewsFilters
                // filters={filters}
                // setFilters={setFilters}
                // setSort={setSort}
                stats={data?.statistics}
              />
              <ReviewsSort
              //  sort={sort}
              //  sort={sort} setSort={setSort}
              />
            </div>
            {/* Reviews */}
            {!isFetching ? (
              <div className="mt-6  grid md:grid-cols-2 gap-4">
                {!!data?.reviews?.length ? (
                  <>
                    <div className="flex flex-col gap-3">
                      {data?.reviews.slice(0, half).map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          product={product}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col gap-3">
                      {data?.reviews.slice(half).map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          product={product}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>No Reviews yet.</>
                )}
              </div>
            ) : (
              <div className="h-24 w-full flex items-center justify-center">
                <DotLoader color="#f5f5f5" />
              </div>
            )}
            {/* {data.length >= pageSize && (
              <Paginaion
                page={page}
                totalPages={
                  filters.rating || filters.hasImages
                    ? data.length / pageSize
                    : 1 / pageSize
                }
                setPage={setPage}
              />
            )} */}
          </>
        </div>
      )}
      {/* <div className="mt-10">
        <ReviewDetails
          productId={productId}
          variant={variant}
          setReviews={setData}
          reviews={data}
          setStatistics={setStatistics}
          setAverageRating={setAverageRating}
        />
      </div> */}
    </div>
  )
}

export default ProductReviews
