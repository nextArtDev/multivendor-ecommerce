// Queries

import DataTable from '@/components/ui/data-table'
import { columns } from '../../components/columns'
import { Plus } from 'lucide-react'

import { getAllCategories } from '@/lib/queries/dashboard'
import { prisma } from '@/lib/prisma'
import { getAllOfferTags } from '@/lib/queries/dashboard/tags'
import { getAllStoreProducts } from '@/lib/queries/dashboard/products'
import { notFound } from 'next/navigation'
import ProductForm from '../../components/new-product-form'

export default async function SellerProductsPage({
  params,
}: {
  params: Promise<{ storeUrl: string,productId:string }>
}) {
  const storeUrl = (await params).storeUrl
  const productId = (await params).productId
 
  const products = await getAllStoreProducts(storeUrl)
  if (!productId) return notFound()
  // console.log({ products })
 
  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create product
        </>
      }
      modalChildren={
        <ProductForm
          categories={categories.categories}
          offerTags={offerTags}
          storeUrl={storeUrl}
          countries={countries}
        />
      }
      newTabLink={`/dashboard/seller/stores/${storeUrl}/products/${products.}new`}
      filterValue="name"
      data={products}
      columns={columns}
      searchPlaceholder="Search product name..."
    />
  )
}
