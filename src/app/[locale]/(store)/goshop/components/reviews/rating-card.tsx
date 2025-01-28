'use client'
// import ReactStars from 'react-rating-stars-component'
import Rating from '@/components/amazon/product/rating'
export default function RatingCard({ rating }: { rating: number }) {
  const fixed_rating = Number(rating.toFixed(2))
  return (
    <div className="w-full h-44 flex-1">
      <div className="p-6 bg-primary/30 backdrop-blur-md flex flex-col h-full justify-center overflow-hidden rounded-lg">
        <div className="text-6xl font-bold">{rating}</div>
        <div className="py-1.5">
          {/* <ReactStars
            count={5}
            value={fixed_rating}
            size={24}
            color="#e2dfdf"
            isHalf
            edit={false}
          /> */}
          <Rating rating={fixed_rating} color="#03c97a" size={8} />
        </div>
        <div className="text-[#03c97a] leading-5 mt-2">
          All from verified purchases
        </div>
      </div>
    </div>
  )
}
