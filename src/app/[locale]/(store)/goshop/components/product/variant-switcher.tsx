import { cn } from '@/lib/utils'

import NextImage from 'next/image'
import Link from 'next/link'
import { Dispatch, FC, SetStateAction } from 'react'
import { VariantSimplified } from '../../lib/queries/product'
import { VariantImageType } from '../../types'

interface Props {
  images: VariantImageType[]
  variants: VariantSimplified[]
  // setVariant: Dispatch<SetStateAction<VariantSimplified>>
  selectedVariantSlug: string
}

const VariantSwitcher: FC<Props> = ({
  images,
  variants,
  // setVariant,
  selectedVariantSlug,
}) => {
  return (
    <div>
      {/* {images.length > 1 && ( */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {images.flatMap((img, index) => (
            <Link
              key={index}
              href={img.url}
              className={cn('p-0.5 rounded-full border-2 border-transparent', {
                'border-border':
                  variants[index].variantSlug === selectedVariantSlug,
              })}
              // onMouseEnter={() => setVariant(variants[index])}
            >
              <NextImage
                src={img.image.url}
                alt=""
                width={100}
                height={100}
                className="w-8 h-8 object-cover rounded-full"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default VariantSwitcher
