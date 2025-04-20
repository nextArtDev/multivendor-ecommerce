import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CouponDetails from '../components/coupon-details'

// import { getAllCategories } from '@/queries/category'
// import { getAllOfferTags } from '@/queries/offer-tag'

export default async function SellerNewCouponPage({
  params,
}: // searchParams,
{
  params: Promise<{ storeUrl: string }>
  // searchParams: Promise<{ categoryId: string }>
}) {
  const storeUrl = (await params).storeUrl
  // const categoryId = (await searchParams).categoryId
  const store = await prisma.store.findFirst({ where: { url: storeUrl } })
  if (!store) return notFound()

  return (
    <div className="w-full">
      <CouponDetails storeUrl={storeUrl} />
    </div>
  )
}
