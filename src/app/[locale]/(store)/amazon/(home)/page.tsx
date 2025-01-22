import HeroCard from '@/components/amazon/hero/hero-card'
import { HeroCarousel } from '@/components/amazon/hero/hero-carousel'
import ProductSlider from '@/components/amazon/product/product-slider'
import Rating from '@/components/amazon/product/rating'
import { Card, CardContent } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { getAllCategories } from '@/lib/queries/dashboard'

const cards = [
  {
    title: 'Categories to explore',
    link: {
      text: 'See More',
      href: '/search',
    },
    items: [],
  },
  {
    title: 'Explore New Arrivals',
    items: [],
    link: {
      text: 'View All',
      href: '/search?tag=new-arrival',
    },
  },
  {
    title: 'Discover Best Sellers',
    items: [],
    link: {
      text: 'View All',
      href: '/search?tag=new-arrival',
    },
  },
  {
    title: 'Featured Products',
    items: [],
    link: {
      text: 'Shop Now',
      href: '/search?tag=new-arrival',
    },
  },
]
const HomePage = async () => {
  const categories = await getAllCategories()
  const carouselItems = categories.map((category) => {
    return {
      title: category.name,
      url: category.url,

      image: category.images?.map((image) => image.url)[1],
      buttonCaption: 'بیشتر',
    }
  })
  const cardItems = categories.map((category) => {
    return {
      title: category.name,
      link: { href: category.id, text: category.name },
      items: category.subCategories?.map((sub) => {
        return {
          name: sub.name,
          items: sub,
          image: sub.images.map((image) => image.url)[0],
          href: sub.url,
        }
      }),
    }
  })
  const products = await prisma.product.findMany({
    include: {
      images: true,
      reviews: true,
    },
  })

  return (
    <div>
      {/* <HeroCarousel items={carouselItems} /> */}
      <div className="md:p-4 md:space-y-4 bg-border">
        {/* <HeroCard cards={cardItems} /> */}
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            {/* <ProductSlider title={t("Today's Deals")} products={todaysDeals} /> */}
            <ProductSlider title={"Today's Deals"} products={products} />
          </CardContent>
        </Card>
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider
              // title={t('Best Selling Products')}
              title={'Best Selling Products'}
              products={products}
              hideDetails
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HomePage
