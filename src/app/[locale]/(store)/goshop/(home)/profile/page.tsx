import OrdersOverview from '../../components/profile/orders-overview'
import ProfileOverview from '../../components/profile/overview'

export default function ProfilePage() {
  return (
    <div className="w-full space-y-4">
      <ProfileOverview />
      <OrdersOverview />
    </div>
  )
}
