// Next.js
import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from '@/navigation'
import { headers } from 'next/headers'

export default async function SellerDashboardPage() {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  const user = await currentUser()
  if (!user) {
    redirect(`/`)
    return // Ensure no further code is executed after redirect
  }

  const stores = await prisma.store.findMany({
    where: {
      userId: user.id,
    },
  })

  if (stores.length === 0) {
    redirect(`/dashboard/seller/stores/new`)
    return // Ensure no further code is executed after redirect
  }

  redirect(`/${locale}/dashboard/seller/stores/${stores[0].url}`)

  return <div>Seller Dashboard</div>
}
