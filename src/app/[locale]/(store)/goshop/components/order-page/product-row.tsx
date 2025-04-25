import { OrderItem } from '@prisma/client'
import Image from 'next/image'
import ProductStatusTag from '../product-status'
import { ProductStatus } from '../../types'

export default function ProductRow({ product }: { product: OrderItem }) {
  return (
    <div className="flex flex-col items-center py-6 gap-6 w-full border-b">
      <div className="w-full">
        <Image
          src={product.image}
          alt=""
          width={200}
          height={200}
          className="w-[300px] h-56 rounded-xl object-cover aspect-square"
        />
      </div>
      <div className="flex items-center w-full">
        <div className="w-full">
          <div className="flex items-center">
            <div>
              <h2 className="font-semibold text-xl leading-8  mb-1 line-clamp-2 pr-2">
                {product.name.split('·')[0]}
              </h2>
              <p className="font-normal text-lg leading-8 text-muted-foreground mb-1">
                {product.name.split('·')[1]}
              </p>
              <p className="font-normal text-sm leading-8 text-muted-foreground mb-1">
                #{product.sku}
              </p>
              <div className="w-full flex flex-col ">
                <p className="font-medium text-base leading-7  pr-4 mr-4 border-r ">
                  Size:{' '}
                  <span className="text-muted-foreground">{product.size}</span>
                </p>
                <p className="font-medium text-base leading-7  ">
                  Qty:{' '}
                  <span className="text-muted-foreground">
                    {product.quantity}
                  </span>
                </p>
                <p className="font-medium text-base leading-7  ">
                  Price:&nbsp;
                  <span className="text-blue-primary">
                    ${product.price.toFixed(2)}
                  </span>
                </p>
                <p className="font-medium text-base leading-7  ">
                  Status:&nbsp;
                  <div className="inline-block">
                    <ProductStatusTag
                      status={product.status as ProductStatus}
                    />
                  </div>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
