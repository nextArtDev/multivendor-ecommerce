'use client'

import React, { useEffect, useState } from 'react'

// import { getRelatedProducts } from '@/queries/product-optimized'
// import { DotLoader } from 'react-spinners'
import {
  getRelatedProducts,
  ProductType,
  RelatedProductType,
} from '../../lib/queries/product'
import ProductList from './product-list'
import RelatedProductSkeleton from '../skeleton/related-products-skeleton'
import { useQuery } from '@tanstack/react-query'
// import ProductPageRelatedSkeletonLoader from "../skeletons/product-page/related";

export default function RelatedProducts({
  products,
  productId,
  categoryId,
  subCategoryId,
}: {
  products: RelatedProductType
  productId: string
  categoryId: string
  subCategoryId: string
}) {
  // console.log(productId, categoryId, subCategoryId)
  // const {
  //   data: products,
  //   isLoading,
  //   isError,
  //   error,
  //   refetch,
  // } = useQuery({
  //   // Include ALL dependencies in the query key
  //   queryKey: ['get-related-products', productId, categoryId, subCategoryId],
  //   queryFn: () => getRelatedProducts(productId, categoryId, subCategoryId),
  //   // Enable query only when all required params are available
  //   enabled: !!productId && !!categoryId && !!subCategoryId,
  //   retry: 3,
  //   staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  //   gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  // })

  // console.log({ products, isLoading, isError, error })
  // const [products, setProducts] = useState<ProductType[]>([])
  // const [loading, setLoading] = useState<boolean>(false)

  // useEffect(() => {
  //   const getRelatedProductsHandler = async () => {
  //     try {
  //       setLoading(true)
  //       const res = await getRelatedProducts(
  //         productId,
  //         categoryId,
  //         subCategoryId
  //       )
  //       setProducts(res)
  //       setLoading(false)
  //     } catch (error) {
  //       console.log(error)
  //       setLoading(false)
  //     }
  //   }
  //   getRelatedProductsHandler()
  // }, [])
  return (
    <div className="pt-6" id="reviews">
      {!!products ? (
        <>
          <div className="h-12">
            <h2 className="text-main-primary text-2xl font-bold">
              You Might Also Like
            </h2>
          </div>
          <ProductList products={products} />
        </>
      ) : (
        <></>
      )}
      {/* {isLoading ? (
          <RelatedProductSkeleton />
        <div>
        </div>
      ) : !!products ? (
        <ProductList products={products} />
      ) : (
        isError && <></>
      )} */}
    </div>
  )
}
