// Queries

import DataTable from '@/components/ui/data-table'

import { Plus } from 'lucide-react'

import {
  getProductById,
  getVariantByProductId,
} from '@/lib/queries/dashboard/products'
import { notFound } from 'next/navigation'
import { columns } from './components/columns'
import VariantDetails from '@/components/dashboard/forms/variant-details'

export default async function SellerProductsPage({
  params,
}: {
  params: Promise<{ storeUrl: string; productId: string }>
}) {
  const storeUrl = (await params).storeUrl
  const productId = (await params).productId

  // Fetching products data from the database for the active store
  const variants = await getVariantByProductId(productId)
  if (!variants || !storeUrl) return notFound()

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          {`Create variant for ${variants[0].product.name}`}
        </>
      }
      modalChildren={
        <VariantDetails data={variants[0]} productId={productId} />
      }
      newTabLink={`/dashboard/seller/stores/${storeUrl}/products/${productId}/variants/new`}
      editTabLink={`/dashboard/seller/stores/${storeUrl}/products/${productId}/variants`}
      filterValue="name"
      data={variants}
      columns={columns}
      searchPlaceholder="Search variant name..."
    />
  )
}
