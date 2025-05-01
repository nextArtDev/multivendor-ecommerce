import OrdersTable from '../../../../components/profile/orders/orders-table'
import { getUserOrders } from '../../../../lib/queries/profile'
import { OrderTableFilter } from '../../../../types'

export default async function ProfileFilteredOrderPage({
  params,
}: {
  params: Promise<{ filter: string }>
}) {
  const filterParam = (await params).filter

  const filter = filterParam ? (filterParam as OrderTableFilter) : ''
  const orders_data = await getUserOrders(filter)
  const { orders, totalPages } = orders_data
  return (
    <div>
      {!!orders_data?.orders.length ? (
        <OrdersTable
          orders={orders}
          totalPages={totalPages}
          prev_filter={filter}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-2xl">
          جست و جو بی‌نتیجه!
        </div>
      )}
    </div>
  )
}
