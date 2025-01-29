'use client'

import { StatisticsCardType } from '../../lib/queries/review'
import Rating from '@/components/amazon/product/rating'

export default function RatingStatisticsCard({
  statistics,
}: {
  statistics: StatisticsCardType
}) {
  return (
    <div className="w-full h-44 flex-1">
      <div className="py-5 px-7 bg-secondary/50 backdrop-blur-lg flex flex-col gap-y-2 h-full justify-center overflow-hidden rounded-lg">
        {statistics
          .slice() //copy
          .reverse()
          .map((rating) => (
            <div key={rating.rating} className="flex items-center h-4">
              {/* <ReactStars
                count={5}
                value={rating.rating}
                size={15}
                color="#e2dfdf"
                isHalf
                edit={false}
              /> */}
              <Rating rating={rating.rating} color="#ffc50A" size={4} />
              <div className="relative w-full flex-1 h-2.5 mx-2.5 bg-primary/40 backdrop-blur-md rounded-full">
                <div
                  className="absolute left-0 h-full rounded-full bg-[#ffc50A]"
                  style={{ width: `${rating.percentage}%` }}
                />
              </div>
              <div className="text-xs w-12 leading-4">{rating.numReviews}</div>
            </div>
          ))}
      </div>
    </div>
  )
}
