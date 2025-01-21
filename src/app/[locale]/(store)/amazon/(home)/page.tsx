import HeroCard from '@/components/amazon/hero/hero-card'
import { HeroCarousel } from '@/components/amazon/hero/hero-carousel'
import Rating from '@/components/amazon/product/rating'
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

  return (
    <div>
      {/* <HeroCarousel items={carouselItems} /> */}
      <div className="md:p-4 md:space-y-4 bg-border">
        {/* <HeroCard cards={cardItems} /> */}
        <Rating rating={4.6} />
      </div>
    </div>
  )
}

export default HomePage
