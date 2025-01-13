import ProductDetails from '@/components/dashboard/forms/product-details'
import { prisma } from '@/lib/prisma'
import { getAllCategories } from '@/lib/queries/dashboard'
// import { db } from '@/lib/db'
// import { getAllCategories } from '@/queries/category'
// import { getAllOfferTags } from '@/queries/offer-tag'

export default async function SellerNewProductPage({
  params,
}: {
  params: { storeUrl: string }
}) {
  const categories = await getAllCategories()
  // const offerTags = await getAllOfferTags()
  const countries = await prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="w-full">
      <ProductDetails
        categories={categories}
        storeUrl={params.storeUrl}
        // offerTags={offerTags}
        countries={countries}
      />
    </div>
  )
}
