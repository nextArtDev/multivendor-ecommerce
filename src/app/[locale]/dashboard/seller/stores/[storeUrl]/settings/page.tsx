// DB
import StoreDetails from '@/components/dashboard/forms/store-details'
import { prisma } from '@/lib/prisma'

import { redirect } from 'next/navigation'

export default async function SellerStoreSettingsPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>
}) {
  const storeUrl = (await params).storeUrl

  const storeDetails = await prisma.store.findUnique({
    where: {
      url: storeUrl,
    },
    include: {
      cover: true,
      logo: true,
    },
  })
  if (!storeDetails) redirect('/dashboard/seller/stores')
  return (
    <div>
      <StoreDetails initialData={storeDetails} />
    </div>
  )
}
