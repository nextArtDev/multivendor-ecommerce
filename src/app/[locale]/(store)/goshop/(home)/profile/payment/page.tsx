import PaymentsTable from '../../../components/profile/payment/payments-table'
import { getUserPayments } from '../../../lib/queries/profile'

export default async function ProfilePaymentPage() {
  const payments_data = await getUserPayments()
  const { payments, totalPages } = payments_data
  return (
    <div>
      <PaymentsTable payments={payments} totalPages={totalPages} />
    </div>
  )
}
