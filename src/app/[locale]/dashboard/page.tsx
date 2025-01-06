// Next.js
import { currentUser } from '@/lib/auth'
import { redirect } from '@/navigation'

export default async function DashboardPage() {
  // Retrieve the current user information
  const user = await currentUser()

  // If user role is not defined or is "USER", redirect to the home page
  if (!user?.role || user?.role === 'USER') {
    redirect('/')
  }

  // If user role is "ADMIN", redirect to the admin dashboard
  if (user?.role === 'ADMIN') {
    redirect('/dashboard/admin')
  }

  // If user role is "SELLER", redirect to the seller dashboard
  if (user?.role === 'SELLER') {
    redirect('/dashboard/seller')
  }
}
