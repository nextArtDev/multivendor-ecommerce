import { auth } from '@/auth'
import AddToCart from '@/components/amazon/product/add-to-cart'
import ProductGallery from '@/components/amazon/product/product-gallery'
import ProductPrice from '@/components/amazon/product/product-price'
import ProductSlider from '@/components/amazon/product/product-slider'
import SelectVariant from '@/components/amazon/product/select-variant'
import { generateId, round2 } from '@/components/amazon/utils'

import { Card, CardContent } from '@/components/ui/card'
// import AddToCart from '@/components/shared/product/add-to-cart'
// import {
//   getProductBySlug,
//   getRelatedProductsByCategory,
// } from '@/lib/actions/product.actions'

// import ReviewList from './review-list'
// import { generateId, round2 } from '@/lib/utils'
// import SelectVariant from '@/components/shared/product/select-variant'
// import ProductPrice from '@/components/shared/product/product-price'
// import ProductGallery from '@/components/shared/product/product-gallery'
// import AddToBrowsingHistory from '@/components/shared/product/add-to-browsing-history'
// import BrowsingHistoryList from '@/components/shared/browsing-history-list'
// import RatingSummary from '@/components/shared/product/rating-summary'
// import ProductSlider from '@/components/shared/product/product-slider'
import { Separator } from '@/components/ui/separator'
import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}) {
  const t = await getTranslations()
  const params = await props.params
  //   const product = await getProductBySlug(params.slug)
  const product = await prisma.product.findFirst({
    where: {
      slug: params.slug,
    },
  })
  if (!product) {
    return { title: t('Product.Product not found') }
  }
  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductDetails(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page: string; color: string; size: string }>
}) {
  const searchParams = await props.searchParams

  const { page, color, size } = searchParams

  const params = await props.params

  const { slug } = params

  const session = await auth()

  //   const product = await getProductBySlug(slug)
  const product = await prisma.product.findFirst({
    where: {
      slug: params.slug,
    },
    include: {
      category: true,
      reviews: true,
      images: true,
      questions: true,
      variants: {
        include: {
          colors: true,
          sizes: true,
          variantImage: true,
          specs: true,
        },
      },
    },
  })
  console.log(product?.variants?.[0].colors.map((col) => col.name)[0])
  if (!product) return notFound()
  //   const relatedProducts = await getRelatedProductsByCategory({
  //     category: product.category,
  //     productId: product._id,
  //     page: Number(page || '1'),
  //   })
  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product?.category,

      NOT: { id: product?.id },
    },
  })

  const t = await getTranslations()
  return (
    <div>
      {/* <AddToBrowsingHistory id={product.id} category={product.category} /> */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5  ">
          <div className="col-span-2">
            <ProductGallery
              images={product?.images.map((image) => image.url)}
            />
          </div>

          <div className="flex w-full flex-col gap-2 md:p-5 col-span-2">
            <div className="flex flex-col gap-3">
              <p className="p-medium-16 rounded-full bg-grey-500/10   text-grey-500">
                {t('Product.Brand')} {product.brand} {product.category.name}
              </p>
              <h1 className="font-bold text-lg lg:text-xl">{product.name}</h1>

              {/* <RatingSummary
                avgRating={product.avgRating}
                numReviews={product.numReviews}
                asPopover
                ratingDistribution={product.ratingDistribution}
              /> */}
              <Separator />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex gap-3">
                  {/* <ProductPrice
                    price={product.price}
                    listPrice={product.listPrice}
                    isDeal={product.tags.includes('todays-deal')}
                    forListing={false}
                  /> */}
                  {/* <ProductPrice
                    price={product.variants.map(vr=>vr.weight)}
                    listPrice={product.listPrice}
                    isDeal={product.tags.includes('todays-deal')}
                    forListing={false}
                  /> */}
                </div>
              </div>
            </div>
            <div>
              <SelectVariant
                product={product}
                // size={size || product.sizes[0]}
                // color={color || product.colors[0]}
                size={
                  size ||
                  product?.variants?.[0].sizes.map((size) => size.size)[0]
                }
                color={
                  color ||
                  product?.variants?.[0].colors.map((col) => col.name)[0]
                }
              />
            </div>
            <Separator className="my-2" />
            <div className="flex flex-col gap-2">
              <p className="p-bold-20 text-grey-600">
                {t('Product.Description')}:
              </p>
              <p
                dangerouslySetInnerHTML={{ __html: product.description }}
                className="p-medium-16 lg:p-regular-18"
              >
                {/* {product.description} */}
              </p>
            </div>
          </div>
          <div>
            <Card>
              <CardContent className="p-4 flex flex-col  gap-4">
                {/* <ProductPrice price={product.price} /> */}
                {/* <ProductPrice price={product.variants[0].weight} /> */}

                {/* {product.countInStock > 0 && product.countInStock <= 3 && (
                  <div className="text-destructive font-bold">
                    {t('Product.Only X left in stock - order soon', {
                      count: product.countInStock,
                    })}
                  </div>
                )} */}
                {product.sales > 0 && product.sales <= 3 && (
                  <div className="text-destructive font-bold">
                    {t('Product.Only X left in stock - order soon', {
                      count: product.sales,
                    })}
                  </div>
                )}
                {/* {product.countInStock !== 0 ? (
                  <div className="text-green-700 text-xl">
                    {t('Product.In Stock')}
                  </div>
                ) : (
                  <div className="text-destructive text-xl">
                    {t('Product.Out of Stock')}
                  </div>
                )} */}
                {product.sales !== 0 ? (
                  <div className="text-green-700 text-xl">
                    {t('Product.In Stock')}
                  </div>
                ) : (
                  <div className="text-destructive text-xl">
                    {t('Product.Out of Stock')}
                  </div>
                )}

                {/* {product.countInStock !== 0 && ( */}
                {product.sales !== 0 && (
                  <div className="flex justify-center items-center">
                    <AddToCart
                      item={{
                        clientId: generateId(),
                        product: product.id,
                        countInStock: product.sales,
                        name: product.name,
                        slug: product.slug,
                        category: product.category,
                        // price: round2(product.price),
                        price: round2(product.variants?.[0].weight),
                        quantity: 1,
                        image: product?.images[0],
                        // size: size || product.sizes[0],
                        // color: color || product.colors[0],
                        size:
                          size ||
                          product?.variants?.[0].sizes.map(
                            (size) => size.size
                          )[0],
                        color:
                          color ||
                          product?.variants?.[0].colors.map(
                            (col) => col.name
                          )[0],
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="h2-bold mb-2" id="reviews">
          {t('Product.Customer Reviews')}
        </h2>
        {/* <ReviewList product={product} userId={session?.user.id} /> */}
      </section>
      <section className="mt-10">
        <ProductSlider
          //   products={relatedProducts.data}
          // title={t('Product.Best Sellers in', { name: product.category })}
          products={relatedProducts.map((rl) => rl)}
          title={t('Product.Best Sellers in', { name: product.category.name })}
        />
      </section>
      <section>{/* <BrowsingHistoryList className="mt-10" /> */}</section>
    </div>
  )
}
