'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/navigation'
import Pagination from '../../pagination'
import ProductList from '../../product/product-list'
import { ProductWishlistType } from '../../../types'

export default function WishlistContainer({
  products,
  page,
  totalPages,
}: {
  products: ProductWishlistType[]
  page: number
  totalPages: number
}) {
  const router = useRouter()
  const [currentPage, setPage] = useState<number>(page)

  useEffect(() => {
    if (currentPage !== page) {
      router.push(`/goshop/profile/wishlist/${currentPage}`)
    }
  }, [currentPage, page])
  return (
    <div>
      <div className="flex flex-wrap pb-16">
        <ProductList products={products} />
      </div>
      <Pagination
        // page={page}
        // setPage={setPage}
        totalPages={totalPages}
      />
    </div>
  )
}
