// Queries

import DataTable from '@/components/ui/data-table'

import { Plus } from 'lucide-react'

import { getProductById } from '@/lib/queries/dashboard/products'
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
  const product = await getProductById(productId)
  if (!product || !storeUrl) return notFound()

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          {`Create variant for ${product.name}`}
        </>
      }
      modalChildren={
        <VariantDetails data={product.variants[0]} productId={productId} />
      }
      newTabLink={`/dashboard/seller/stores/${storeUrl}/products/${product.id}/variants/new`}
      editTabLink={`/dashboard/seller/stores/${storeUrl}/products/${product.id}/variants`}
      filterValue="name"
      data={product.variants}
      columns={columns}
      searchPlaceholder="Search variant name..."
    />
  )
}
