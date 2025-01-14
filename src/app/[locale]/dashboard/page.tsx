// Next.js
import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function DashboardPage() {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  // Retrieve the current user information
  const user = await currentUser()

  // If user role is not defined or is "USER", redirect to the home page
  if (!user?.role || user?.role === 'USER') {
    redirect(`/${locale}`)
  }

  // If user role is "ADMIN", redirect to the admin dashboard
  if (user?.role === 'ADMIN') {
    redirect(`/${locale}/dashboard/admin`)
  }

  // If user role is "SELLER", redirect to the seller dashboard
  if (user?.role === 'SELLER') {
    redirect(`/${locale}/dashboard/seller`)
  }
}
