'use client'

import * as React from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import data from '@/constants/amazon-data'
// import { ICarousel } from '@/types'

// export function HomeCarousel({ items }: { items: ICarousel[] }) {
export default function HeroCarousel() {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(null)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [totalItems, setTotalItems] = React.useState(0)

  React.useEffect(() => {
    if (!carouselApi) return

    const updateCarouselState = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap())
      setTotalItems(carouselApi.scrollSnapList().length)
    }

    updateCarouselState()

    carouselApi.on('select', updateCarouselState)

    return () => {
      carouselApi.off('select', updateCarouselState) // Clean up on unmount
    }
  }, [carouselApi])

  const scrollToIndex = (index: number) => {
    carouselApi?.scrollTo(index)
  }

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  const t = useTranslations('Home')

  return (
    <Carousel
      dir="ltr"
      setApi={setCarouselApi}
      opts={{ loop: true }}
      plugins={[plugin.current]}
      className="w-full mx-auto "
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {/* {items.map((item) => ( */}
        {data.carousels.map((item, index) => (
          <CarouselItem key={index}>
            <Link href={item.url}>
              <div className="flex aspect-[16/6] items-center justify-center p-6 relative -m-1">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute w-1/3 left-16 md:left-32 top-1/2 transform -translate-y-1/2">
                  <h2
                    className={cn(
                      'text-xl md:text-6xl font-bold mb-4 text-primary  '
                    )}
                  >
                    {/* {t(`${item.title}`)} */}
                    title
                  </h2>
                  <Button className="hidden md:block">
                    {/* {t(`${item.buttonCaption}`)} */}
                    buttonCaption
                  </Button>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0 md:left-12" />
      <CarouselNext className="right-0 md:right-12" />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
        {Array.from({ length: totalItems }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? 'bg-black' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </Carousel>
  )
}
