import { cn } from '@/lib/utils'
import { Dispatch, FC, SetStateAction } from 'react'
import {
  RatingStatisticsType,
  ReviewsFiltersType,
  ReviewsOrderType,
} from '../../lib/queries/review'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from '@/navigation'
import { useSearchParams } from 'next/navigation'
import {
  parseAsBoolean,
  parseAsFloat,
  parseAsString,
  useQueryState,
  useQueryStates,
} from 'nuqs'

interface Props {
  // filters: ReviewsFiltersType
  // setFilters: Dispatch<SetStateAction<ReviewsFiltersType>>
  // setSort: Dispatch<SetStateAction<ReviewsOrderType | undefined>>
  stats: RatingStatisticsType
}

// const ReviewsFilters: FC<Props> = ({ filters, setFilters, setSort, stats }) => {
const ReviewsFilters: FC<Props> = ({ stats }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // const sort = searchParams.get('sort')

  // const rating = searchParams.get('rating')
  // const hasImages = searchParams.get('hasImages')

  const [sort, setSort] = useQueryState('sort')

  const [filters, setFilters] = useQueryStates({
    rating: parseAsFloat.withDefault(0),
    hasImages: parseAsBoolean.withDefault(false),
  })
  // const [hasImagesFilter, setHasImagesFilter] = useQueryState('hasImagesFilter')

  // const filters = {
  //   ratingFilter,
  //   hasImagesFilter,
  // }
  const { rating, hasImages } = filters
  const { ratingStatistics, reviewsWithImagesCount, totalReviews } = stats
  return (
    <div className="mt-8 relative overflow-hidden">
      <div className="flex flex-wrap gap-4">
        {/* All */}
        <Button
          variant={!rating && !hasImages ? 'ghost' : 'default'}
          className={cn(
            '  border border-transparent rounded-full cursor-pointer py-1.5 px-4 xxx',
            {
              ' text-[#fd384f] border-[#fd384f]': !rating && !hasImages,
            }
          )}
          onClick={() => {
            setFilters({ rating: undefined, hasImages: undefined })
            setSort(null)
          }}
        >
          All ({totalReviews})
        </Button>
        {/* Includes Pic */}
        <Button
          variant={hasImages ? 'ghost' : 'default'}
          className={cn(
            '  border border-transparent rounded-full cursor-pointer py-1.5 px-4',
            {
              ' text-[#fd384f] border-[#fd384f]': hasImages,
            }
          )}
          // onClick={() => setFilters({ ...filters, hasImages: true })}
          onClick={() => setFilters({ ...filters, hasImages: true })}
        >
          Include Pictures ({reviewsWithImagesCount})
        </Button>
        {/* Rating Filters */}
        {ratingStatistics.map((r) => (
          <Button
            variant={r.rating === rating ? 'ghost' : 'default'}
            key={r.rating}
            className={cn(
              '  border border-transparent rounded-full cursor-pointer py-1.5 px-4',
              {
                ' text-[#fd384f] border-[#fd384f]': r.rating === rating,
              }
            )}
            onClick={() => setFilters({ ...filters, rating: r.rating })}
          >
            {r.rating} stars ({r.numReviews})
          </Button>
        ))}
      </div>
    </div>
  )
}

export default ReviewsFilters
