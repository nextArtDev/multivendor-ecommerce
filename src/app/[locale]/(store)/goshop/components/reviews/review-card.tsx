'use client'

import NextImage from 'next/image'
import ReactStars from 'react-rating-stars-component'
import Rating from '@/components/amazon/product/rating'
import { ReviewWithImageType } from '../../lib/queries/review'
import { User } from 'lucide-react'
import { ProductDataType } from '../../types'

export default function ReviewCard({
  review,
  product,
}: {
  review: ReviewWithImageType
  product: ProductDataType
}) {
  const { images, user } = review
  const colors = review.color
    .split(',')
    .filter((color) => color.trim() !== '') // Remove any empty strings
    .map((color) => ({ name: color.trim() }))

  const { name } = user
  const cesnoredName = `${name[0]}${name[1]}***${name[user.name.length - 2]}${
    name[user.name.length - 1]
  }`
  return (
    <div className="border border-secondary bg-primary/40 backdrop-blur-md rounded-xl flex h-fit relative py-4 px-2.5">
      <div className="w-16 px- space-y-1">
        {/* {user?.image ? (
          <NextImage
            src={user?.image?.url}
            alt="Profile image"
            width={100}
            height={100}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : ( */}
        <User
          className="border border-primary p-1 rounded-full text-primary "
          size={35}
        />
        {/* )} */}
        <span className="text-xs capitalize ">{cesnoredName}</span>
      </div>
      <div className="flex flex-1 flex-col justify-between leading-5 overflow-hidden px-1.5">
        <div className="space-y-2">
          {/* <ReactStars
            count={5}
            size={24}
            color="#F5F5F5"
            activeColor="#FFD804"
            value={review.rating}
            isHalf
            edit={false}
          />  */}
          <Rating rating={review.rating} color="#FFD804" size={6} />
          <div className="flex items-center gap-x-2">
            <NextImage
              src={product?.images?.[1].url}
              alt=""
              width={40}
              height={40}
              className="object-cover w-9 h-9 rounded-full"
            />

            <div className="text-secondary text-sm">{product?.name}</div>
            <span>.</span>
            {/* <div className="text-secondary text-sm">
              {variant?.sizes?.[0].size}
            </div>
            <span>.</span> */}
            <div className="text-secondary text-sm">{review.quantity} PC</div>
            <div className="text-secondary text-sm">
              {review.createdAt.toLocaleString()}{' '}
            </div>
          </div>
          <p className="text-sm">{review.review}</p>
          {images?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images?.map((img) => (
                <div
                  key={img.id}
                  className="w-20 h-20 rounded-xl overflow-hidden cursor-pointer"
                >
                  <NextImage
                    src={img.url}
                    alt={product?.name || ''}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
