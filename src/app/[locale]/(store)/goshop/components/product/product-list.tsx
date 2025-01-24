// import { ProductType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { FC } from 'react'

import { ProductType } from '../../lib/queries/product'
import ProductCard from './product-card'
import Image from 'next/image'

interface Props {
  products: ProductType[]
  title?: string
  link?: string
  arrow?: boolean
}

const ProductList: FC<Props> = ({ products, title, link, arrow }) => {
  const Title = () => {
    if (link) {
      return (
        <Link href={link} className="h-12">
          <h2 className="text-main-primary text-xl font-bold">
            {title}&nbsp;
            {arrow && <ChevronRight className="w-3 inline-block" />}
          </h2>
        </Link>
      )
    } else {
      return (
        <h2 className="text-main-primary text-xl font-bold">
          {title}&nbsp;
          {arrow && <ChevronRight className="w-3 inline-block" />}
        </h2>
      )
    }
  }
  return (
    <div className="relative">
      {title && <Title />}
      {products.length > 0 ? (
        <div
          className={cn('flex flex-wrap ', {
            'mt-2': title,
          })}
        >
          <div className="flex  flex-wrap ">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        'No Products.'
      )}
    </div>
  )
}

export default ProductList
