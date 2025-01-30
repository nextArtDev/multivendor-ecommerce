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
import { Toggle } from '@/components/ui/toggle'
import { AnimatePresence, motion } from 'framer-motion'
interface Props {
  // filters: ReviewsFiltersType
  // setFilters: Dispatch<SetStateAction<ReviewsFiltersType>>
  // setSort: Dispatch<SetStateAction<ReviewsOrderType | undefined>>
  stats: RatingStatisticsType
}

// const ReviewsFilters: FC<Props> = ({ filters, setFilters, setSort, stats }) => {
const ReviewsFilters: FC<Props> = ({ stats }) => {
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
    <div className="mt-8 relative overflow-hidden flex flex-col">
      <div className="flex flex-wrap gap-3 m-1.5 ">
        {/* All */}
        <Toggle
          // variant={'outline'}
          // variant={!rating && !hasImages ? 'ghost' : 'default'}
          className={cn(
            'outline outline-[1px]  rounded-full cursor-pointer py-1.5 px-4 xxx',
            {
              ' text-[#fd384f] outline-[#fd384f]': !rating && !hasImages,
            }
          )}
          onClick={() => {
            setFilters({ rating: null, hasImages: null })
            setSort(null)
          }}
        >
          All ({totalReviews})
        </Toggle>
        {/* Includes Pic */}
        <Toggle
          variant={'outline'}
          className={cn(
            ' outline outline-[1px]  rounded-full cursor-pointer py-1.5 px-4',
            {
              ' text-[#fd384f] outline-[#fd384f]': hasImages,
            }
          )}
          // onClick={() => setFilters({ ...filters, hasImages: true })}
          onClick={() =>
            hasImages
              ? setFilters({ ...filters, rating: null, hasImages: null })
              : setFilters({ ...filters, rating: null, hasImages: true })
          }
        >
          Include Pictures ({reviewsWithImagesCount})
        </Toggle>
      </div>
      <div className="flex flex-wrap gap-3 m-1.5">
        {/* Rating Filters */}
        {ratingStatistics.map((r) => (
          <Toggle
            variant={'outline'}
            key={r.rating}
            className={cn(
              'relative outline outline-[1px]  rounded-full cursor-pointer py-1.5 px-4',
              {
                'neon   outline-[#fd384f]': r.rating === rating,
              }
            )}
            onClick={() =>
              r.rating === rating
                ? setFilters({ ...filters, rating: null })
                : setFilters({ ...filters, rating: r.rating })
            }
          >
            {r.rating === rating && (
              <motion.div
                className="absolute -inset-1 bg-[#fd384f] -z-10  rounded-full"
                layoutId="arrow"
              >
                <span className="" />
              </motion.div>
            )}
            {r.rating} stars ({r.numReviews})
          </Toggle>
        ))}
      </div>
    </div>
  )
}

export default ReviewsFilters
