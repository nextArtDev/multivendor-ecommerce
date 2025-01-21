import HeroCard from '@/components/amazon/hero/hero-card'
import HeroCarousel, {
  HomeCarousel,
} from '@/components/amazon/hero/hero-carousel'

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
function page() {
  return (
    <div>
      <HeroCarousel />
      <div className="md:p-4 md:space-y-4 bg-border">
        <HeroCard cards={cards} />
      </div>
    </div>
  )
}

export default page
