// Queries
import DataTable from '@/components/ui/data-table'

import { getStoreOrders } from '@/lib/queries/dashboard/store'
import { columns } from './components/columns'

export default async function SellerOrdersPage({
  params,
}: {
  params: { storeUrl: string }
}) {
  const orders = await getStoreOrders(params.storeUrl)
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
