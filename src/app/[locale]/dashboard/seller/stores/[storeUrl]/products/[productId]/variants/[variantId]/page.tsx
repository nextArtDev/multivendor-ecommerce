import VariantDetails from '@/components/dashboard/forms/variant-details'
import { getVariantById } from '@/lib/queries/dashboard/products'

export default async function SellerNewProductVariantPage({
  params,
}: {
  //   params: { storeUrl: string; productId: string }
  params: Promise<{ storeUrl: string; productId: string; variantId: string }>
}) {
  const storeUrl = (await params).storeUrl
  const productId = (await params).productId
  const variantId = (await params).variantId
  const variant = await getVariantById(variantId)

  if (!storeUrl || !productId || !variantId || !variant) return null
  console.log(
    variant.variantImage?.map((img) => ({
      url: img.url,
      file: undefined,
      id: img.id,
    }))
  )
  return (
    <div>
      <VariantDetails data={variant} productId={productId} />
    </div>
  )
}
