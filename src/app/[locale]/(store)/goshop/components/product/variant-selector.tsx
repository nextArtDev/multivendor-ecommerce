'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Dispatch, FC, SetStateAction } from 'react'
import { CartProductType, ProductVariantDataType } from '../../types'
import { useQueryState } from 'nuqs'

interface Props {
  variants: ProductVariantDataType[]
  slug: string
  setActiveImage: Dispatch<SetStateAction<{ url: string } | null>>
  handleChange: (property: keyof CartProductType, value: unknown) => void
  sizeId?: string
  // setSizeId: Dispatch<SetStateAction<string>>
  // setVariant: Dispatch<SetStateAction<ProductVariantDataType>>
}

const ProductVariantSelector: FC<Props> = ({
  variants,
  slug,
  setActiveImage,
  handleChange,
  sizeId,
  // setSizeId,
  // setVariant,
}) => {
  const [variantSlug, setVariantSlug] = useQueryState('variant')
  // const [sizeId, setSizeId] = useQueryState('size')
  // console.log({ variantSlug })
  const pathname = usePathname()
  const { replace } = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)

  const handleSelectVariant = (variant: ProductVariantDataType) => {
    if (variants.length === 1) return
    // setVariant(variant)
    setVariantSlug(variant.slug)
    setActiveImage(variant.variantImage[0])

    // if (variant.sizes.length === 1) {
    //   // setSizeId(sizeId || variant.sizes[0].id)
    //   sizeId ===
    // } else {
    //   // setSizeId('')
    // }
    params.set('variant', variant.slug)
    params.set(
      'sizeId',
      variant.sizes.length === 1 ? variant.sizes[0].id : sizeId || ''
    )
    replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    })
  }
  return (
    <div className="flex items-center flex-wrap gap-2">
      {variants.map((variant, i) => (
        <div
          onClick={() => handleSelectVariant(variant)}
          key={i}
          onMouseEnter={() => {
            //  setVariantImages(variant.images);
            // setActiveImage(variant.images[0]);
          }}
          onMouseLeave={() => {
            //   setVariantImages(activeVariant?.images || []);
            // setActiveImage(activeVariant?.images[0] || null);
          }}
        >
          <div
            className={cn(
              'w-12 h-12 max-h-12 rounded-full grid place-items-center overflow-hidden outline-[1px] outline-transparent outline-dashed outline-offset-2 cursor-pointer transition-all duration-75 ease-in',
              {
                'outline-main-primary': variantSlug
                  ? variantSlug === variant.slug
                  : i == 0,
              }
            )}
          >
            <Image
              src={variant.variantImage.map((img) => img.url)[0]}
              alt={`product variant `}
              width={60}
              height={60}
              className="w-12 h-12 rounded-full object-cover object-center"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductVariantSelector
