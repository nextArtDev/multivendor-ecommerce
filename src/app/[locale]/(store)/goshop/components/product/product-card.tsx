'use client'
import Link from 'next/link'
import { useState } from 'react'
// import ReactStars from 'react-rating-stars-component'
// import { ProductType, VariantSimplified } from "@/lib/types";
// import ProductCardImageSwiper from "./swiper";
// import VariantSwitcher from "./variant-switcher";
// import { Button } from "@/components/store/ui/button";
// import ProductPrice from "../../product-page/product-info/product-price";
// import { addToWishlist } from "@/queries/user";
// import toast from "react-hot-toast";

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ProductType, VariantSimplified } from '../../lib/queries/product'
import ProductCardImageSwiper from './swiper'
import Rating from '@/components/amazon/product/rating'
import VariantSwitcher from './variant-switcher'
import ProductPrice from './product-price'
import { toggleWishlistItem } from '../../lib/queries/user'
import { notFound, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getVariantBySlugAndProductId } from '@/lib/queries/dashboard/products'
import Loading from '../../../amazon/(home)/loading'

export default function ProductCard({ product }: { product: ProductType }) {
  const { name, slug, rating, sales, images, variants, variantImages, id } =
    product
  const variantParams = useSearchParams()
  const variantSlugParam = variantParams.get('variant')

  const {
    data: variant,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['get-variants-by-slug', product.id, variantSlugParam],
    queryFn: () => getVariantBySlugAndProductId(product.id, variantSlugParam!),
    enabled: !!variantSlugParam && !!product.id, // Only run query if we have required params
    retry: 3, // Retry failed requests 3 times
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  // Handle loading state
  if (isLoading) {
    return <Loading />
  }

  // Handle error state
  // if (isError) {
  //   return (
  //     <div className="rounded-2xl w-[190px] min-[480px]:w-[225px] p-4 border border-red-200 bg-red-50">
  //       <div className="text-center">
  //         <p className="text-red-600 text-sm mb-2">
  //           Failed to load product variant
  //         </p>
  //         <Button
  //           onClick={() => refetch()}
  //           variant="outline"
  //           size="sm"
  //           className="text-red-600 border-red-200 hover:bg-red-50"
  //         >
  //           Try Again
  //         </Button>
  //       </div>
  //     </div>
  //   )
  // }
  const handleAddToWishlist = async () => {
    try {
      const res = await toggleWishlistItem(id, variant?.id!)
      if (res) toast.success(res.message)
    } catch (error: any) {
      toast.error(error.toString())
    }
  }
  // Handle case where variant data is not available
  // if (!variant) {
  //   return (
  //     <div className="rounded-2xl w-[190px] min-[480px]:w-[225px] p-4 border border-yellow-200 bg-yellow-50">
  //       <div className="text-center">
  //         <p className="text-yellow-600 text-sm">Product variant not found</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <section>
      <div
        className={cn(
          'group rounded-2xl w-[190px] min-[480px]:w-[225px] relative transition-all duration-75 bg-primary/30 backdrop-blur-md ease-in-out p-4  border border-transparent hover:shadow-xl ',
          {
            '': true,
          }
        )}
      >
        <div className=" bg-transparent relative w-full h-full">
          <Link
            href={`/goshop/product/${slug}?variant=${variantSlugParam}`}
            className="w-full relative inline-block overflow-hidden"
          >
            {/* Images Swiper */}
            {images && <ProductCardImageSwiper images={images} />}
            {/* Title */}
            <div className="text-sm   h-[18px] overflow-hidden overflow-ellipsis line-clamp-1">
              {name} · {variant?.variantName}
            </div>
            {/* Rating - Sales */}
            {product.rating > 0 && product.sales > 0 && (
              <div className="flex items-center gap-x-1 h-5">
                <Rating rating={rating} size={5} color="yellow" />
                <div className="text-xs ">{sales} sold</div>
              </div>
            )}
            {/* Price */}
            <ProductPrice
              sizes={variant?.sizes!}
              isCard
              handleChange={() => {}}
            />
          </Link>
        </div>
        <div className="hidden   group-hover:block absolute -left-[1px] bg-primary/30 backdrop-blur-md border border-t-0  w-[calc(100%+2px)] px-4 pb-4 rounded-b-3xl shadow-xl z-30 space-y-2">
          {/* Variant switcher */}
          <VariantSwitcher
            images={variantImages}
            variants={variants}
            selectedVariantSlug={variantSlugParam!}
          />
          {/* Action buttons */}
          <div className="flex flex-items gap-x-1">
            <Button className="rounded-full ">
              <Link href={`/goshop/product/${slug}/${variantSlugParam}`}>
                Add to cart
              </Link>
            </Button>
            <Button
              className="rounded-full "
              size="icon"
              onClick={() => handleAddToWishlist()}
            >
              <Heart className="w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
