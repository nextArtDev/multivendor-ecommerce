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

export default function ProductCard({ product }: { product: ProductType }) {
  const { name, slug, rating, sales, images, variants, id } = product
  const [variant, setVariant] = useState<VariantSimplified>(variants[0])
  const { variantSlug, variantName, images: variantImages, sizes } = variant

  const handleAddToWishlist = async () => {
    try {
      const res = await toggleWishlistItem(id, variant.variantId)
      if (res) toast.success(res.message)
    } catch (error: any) {
      toast.error(error.toString())
    }
  }

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
            href={`/goshop/product/${slug}?variant=${variantSlug}`}
            className="w-full relative inline-block overflow-hidden"
          >
            {/* Images Swiper */}
            {images && <ProductCardImageSwiper images={images} />}
            {/* Title */}
            <div className="text-sm   h-[18px] overflow-hidden overflow-ellipsis line-clamp-1">
              {name} · {variantName}
            </div>
            {/* Rating - Sales */}
            {product.rating > 0 && product.sales > 0 && (
              <div className="flex items-center gap-x-1 h-5">
                {/* <ReactStars
                  count={5}
                  size={24}
                  color="#F5F5F5"
                  activeColor="#FFD804"
                  value={rating}
                  isHalf
                  edit={false}
                /> */}
                <Rating rating={rating} size={5} color="yellow" />
                <div className="text-xs ">{sales} sold</div>
              </div>
            )}
            {/* Price */}
            <ProductPrice sizes={sizes} isCard handleChange={() => {}} />
          </Link>
        </div>
        <div className="hidden   group-hover:block absolute -left-[1px] bg-primary/30 backdrop-blur-md border border-t-0  w-[calc(100%+2px)] px-4 pb-4 rounded-b-3xl shadow-xl z-30 space-y-2">
          {/* Variant switcher */}
          <VariantSwitcher
            images={variantImages}
            variants={variants}
            setVariant={setVariant}
            selectedVariant={variant}
          />
          {/* Action buttons */}
          <div className="flex flex-items gap-x-1">
            <Button className="rounded-full ">
              <Link href={`/goshop/product/${slug}/${variantSlug}`}>
                Add to cart
              </Link>
            </Button>
            <Button
              className="rounded-full "
              // variant="black"
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
