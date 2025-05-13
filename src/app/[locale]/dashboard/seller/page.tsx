// Next.js
import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SellerDashboardPage() {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  const user = await currentUser()
  if (!user) {
    redirect(`/${locale}`)
    return // Ensure no further code is executed after redirect
  }

  const stores = await prisma.store.findMany({
    where: {
      userId: user.id,
    },
  })

  if (stores.length === 0) {
    redirect(`/${locale}/dashboard/seller/stores/new`)
    return // Ensure no further code is executed after redirect
  }

  redirect(`/${locale}/dashboard/seller/stores/${stores[0].url}`)

  return <div>Seller Dashboard</div>
}
