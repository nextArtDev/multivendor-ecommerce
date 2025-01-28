import { cn } from '@/lib/utils'
import { Dispatch, FC, SetStateAction } from 'react'
import {
  RatingStatisticsType,
  ReviewsFiltersType,
  ReviewsOrderType,
} from '../../lib/queries/review'
import { Button } from '@/components/ui/button'

interface Props {
  filters: ReviewsFiltersType
  setFilters: Dispatch<SetStateAction<ReviewsFiltersType>>
  stats: RatingStatisticsType
  setSort: Dispatch<SetStateAction<ReviewsOrderType | undefined>>
}

const ReviewsFilters: FC<Props> = ({ filters, setFilters, setSort, stats }) => {
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
            setSort(undefined)
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
