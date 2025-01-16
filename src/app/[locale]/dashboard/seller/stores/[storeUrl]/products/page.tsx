// Queries

import DataTable from '@/components/ui/data-table'
import { columns } from './components/columns'
import { Plus } from 'lucide-react'

import { getAllCategories } from '@/lib/queries/dashboard'
import { prisma } from '@/lib/prisma'
import ProductDetails from '@/components/dashboard/forms/product-details'
import { getAllOfferTags } from '@/lib/queries/dashboard/tags'
import { getAllStoreProducts } from '@/lib/queries/dashboard/products'
import { notFound } from 'next/navigation'

export default async function SellerProductsPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>
}) {
  const storeUrl = (await params).storeUrl
  // Fetching products data from the database for the active store
  const products = await getAllStoreProducts(storeUrl)
  if (!products) return notFound()
  // console.log({ products })

  const categories = await getAllCategories()
  const offerTags = await getAllOfferTags()

  const countries = await prisma.country.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create product
        </>
      }
      modalChildren={
        <ProductDetails
          categories={categories}
          offerTags={offerTags}
          storeUrl={storeUrl}
          countries={countries}
        />
      }
      newTabLink={`/dashboard/seller/stores/${storeUrl}/products/new`}
      filterValue="name"
      data={products}
      columns={columns}
      searchPlaceholder="Search product name..."
    />
  )
}
