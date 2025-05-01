import OrdersTable from '../../../components/profile/orders/orders-table'
import { getUserOrders } from '../../../lib/queries/profile'

export default async function ProfileOrdersPage() {
  const orders_data = await getUserOrders()
  const { orders, totalPages } = orders_data
  return (
    <div>
      <OrdersTable orders={orders} totalPages={totalPages} />
    </div>
  )
}
