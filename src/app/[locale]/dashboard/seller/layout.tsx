import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

import { ReactNode } from 'react'

export default async function SellerDashboardLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const locale = (await params).locale
  // Block non sellers from accessing the seller dashboard
  const user = await currentUser()

  if (user?.role !== 'SELLER') redirect(`${locale}`)
  return <div>{children}</div>
}
