'use client'

import ReviewsSort from '../reviews/sort'
import ForkedContentLoader from '../skeleton'

export default function ProductPageReviewsSkeletonLoader({
  numReviews,
}: {
  numReviews: number
}) {
  const ratingStatistics = [
    { index: 0, width: 43 },
    { index: 1, width: 150 },
    { index: 2, width: 70 },
    { index: 3, width: 70 },
    { index: 4, width: 70 },
    { index: 5, width: 70 },
    { index: 5, width: 72 },
    { index: 6, width: 72 },
  ]
  const arrayLength = numReviews > 4 ? 4 : numReviews
  const reviews = Array.from({ length: arrayLength }, (_, index) => index + 1)

  return (
    <div>
      {/* Title */}
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">
          Custom Reviews ({numReviews})
        </h2>
      </div>
      {/* Statistics */}
      <div className="w-full">
        <div className="w-full grid md:grid-cols-2 items-center gap-4">
          <ForkedContentLoader
            height={176}
            width="100%"
            backgroundColor="#f5f5f565"
            className="rounded-md"
          >
            <rect x="0" y="0" width="100%" height="176" />
          </ForkedContentLoader>
          <ForkedContentLoader
            height={176}
            width="100%"
            backgroundColor="#f5f5f565"
            className="rounded-md"
          >
            <rect x="0" y="0" width="100%" height="176" />
          </ForkedContentLoader>
        </div>
      </div>
      <div className="space-y-6">
        <div className="mt-8 relative flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            {ratingStatistics.splice(0, 2).map((r) => (
              <div
                key={r.index}
                className="bg-primary/30 backdrop-blur-sm text-main-primary border border-transparent rounded-full cursor-pointer py-1.5 px-4"
              >
                <ForkedContentLoader
                  height={25}
                  width={r.width}
                  backgroundColor="#f5f5f565"
                  className="rounded-md"
                >
                  <rect x="0" y="0" />
                </ForkedContentLoader>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {ratingStatistics.splice(1, 7).map((r) => (
              <div
                key={r.index}
                className="bg-primary/30 backdrop-blur-sm text-main-primary border border-transparent rounded-full cursor-pointer py-1.5 px-4"
              >
                <ForkedContentLoader
                  height={25}
                  width={r.width}
                  backgroundColor="#f5f5f565"
                  className="rounded-md"
                >
                  <rect x="0" y="0" />
                </ForkedContentLoader>
              </div>
            ))}
          </div>
        </div>
        <ReviewsSort />
      </div>
      <div className="w-full mt-6 grid md:grid-cols-2 gap-3">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ForkedContentLoader
              key={review}
              height="100%"
              width="100%"
              backgroundColor="#f5f5f565"
              className="rounded-md"
            >
              <rect x="0" y="0" height={176} width="100%" />
            </ForkedContentLoader>
          ))
        ) : (
          <>No Reviews.</>
        )}
      </div>
    </div>
  )
}
