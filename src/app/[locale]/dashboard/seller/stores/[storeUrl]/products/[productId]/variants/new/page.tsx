import VariantDetails from '@/components/dashboard/forms/variant-details'

import { notFound } from 'next/navigation'

export default async function SellerNewProductVariantPage({
  params,
}: {
  //   params: { storeUrl: string; productId: string }
  params: Promise<{ storeUrl: string; productId: string }>
}) {
  const storeUrl = (await params).storeUrl
  const productId = (await params).productId

  // Fetching products data from the database for the active store
  // const product = await getProductById(productId)
  if (!productId || !storeUrl) return notFound()
  // if (!product) return null

  return (
    <div>
      <VariantDetails productId={productId} />
    </div>
  )
}
