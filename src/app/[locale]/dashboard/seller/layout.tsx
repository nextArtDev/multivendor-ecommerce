import { currentUser } from '@/lib/auth'
import { redirect } from '@/navigation'

import { ReactNode } from 'react'

export default async function SellerDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  // Block non sellers from accessing the seller dashboard
  const user = await currentUser()

  if (user?.role !== 'SELLER') redirect('/')
  return <div>{children}</div>
}
