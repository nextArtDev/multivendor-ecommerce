// Queries
import DataTable from '@/components/ui/data-table'

import { getStoreOrders } from '@/lib/queries/dashboard/store'
import { columns } from './components/columns'

export default async function SellerOrdersPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>
}) {
  const storeUrl = (await params).storeUrl
  const orders = await getStoreOrders(storeUrl)
  return (
    <div>
      <DataTable
        filterValue="id"
        data={orders}
        columns={columns}
        searchPlaceholder="Search order by id ..."
      />
    </div>
  )
}
