// Queries

import DataTable from '@/components/ui/data-table'
import { columns } from './components/columns'
import { Plus } from 'lucide-react'

import { notFound } from 'next/navigation'
import { getAllStoreCoupons } from '@/lib/queries/dashboard/coupons'
import CouponDetails from './components/coupon-details'

export default async function SellerCouponsPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>
}) {
  const storeUrl = (await params).storeUrl
  // Fetching coupons data from the database for the active store
  const coupons = await getAllStoreCoupons(storeUrl)
  if (!coupons) return notFound()

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create coupon
        </>
      }
      modalChildren={<CouponDetails storeUrl={storeUrl} />}
      newTabLink={`/dashboard/seller/stores/${storeUrl}/coupons/new`}
      filterValue="name"
      data={coupons}
      columns={columns}
      searchPlaceholder="Search coupon name..."
    />
  )
}
