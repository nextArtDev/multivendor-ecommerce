'use client'

import React, { useEffect, useState } from 'react'

// import { getRelatedProducts } from '@/queries/product-optimized'
// import { DotLoader } from 'react-spinners'
import { getRelatedProducts, ProductType } from '../../lib/queries/product'
import ProductList from './product-list'
import RelatedProductSkeleton from './related-products-skeleton'
// import ProductPageRelatedSkeletonLoader from "../skeletons/product-page/related";

export default function RelatedProducts({
  productId,
  categoryId,
  subCategoryId,
}: {
  productId: string
  categoryId: string
  subCategoryId: string
}) {
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const getRelatedProductsHandler = async () => {
      try {
        setLoading(true)
        const res = await getRelatedProducts(
          productId,
          categoryId,
          subCategoryId
        )
        setProducts(res)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
      }
    }
    getRelatedProductsHandler()
  }, [])
  return (
    <div className="pt-6" id="reviews">
      {/* Title */}
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">
          You Might Also Like
        </h2>
      </div>
      {/* Products */}
      {loading ? (
        <div>
          <RelatedProductSkeleton />
        </div>
      ) : (
        <ProductList products={products} />
      )}
    </div>
  )
}
