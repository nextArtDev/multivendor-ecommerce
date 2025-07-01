'use client'
// import { ProductType } from "@/lib/types";
// import { getProducts } from "@/queries/product";
// import ProductList from "../shared/product-list";
// import ProductPageStoreProductsSkeletonLoader from "../skeletons/product-page/store-products";
import { FC, useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { getProducts, ProductType } from '../../lib/queries/product'
import ProductList from './product-list'
import ProductPageStoreProductsSkeletonLoader from '../skeleton/store-products'
import { useQuery } from '@tanstack/react-query'

interface Props {
  storeUrl: string
  storeName: string
  count: number
}

const StoreProducts: FC<Props> = ({ storeUrl, count, storeName }) => {
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getStoreProducts()
  }, [])

  // const { data, isLoading } = useQuery({
  //   queryKey: ['get-product'],
  //   queryFn: () => getProducts({ store: storeUrl }, '', 1, count),
  // })

  const getStoreProducts = async () => {
    try {
      setLoading(true)

      const res = await getProducts({ store: storeUrl }, '', 1, count)
      setProducts(res.products)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  return (
    <div className="pt-6" id="reviews">
      {/* Title */}
      <div className="h-12">
        <h2 className=" text-2xl font-bold">
          Recommended from Global Goods Marketplace
          <ChevronRight className="w-3 inline-block" />
        </h2>
      </div>
      {/* Products */}
      <div className="mt-8 min-[620px]:mt-0">
        {loading ? (
          <ProductPageStoreProductsSkeletonLoader />
        ) : (
          <ProductList products={products} />
        )}
      </div>
    </div>
  )
}

export default StoreProducts
