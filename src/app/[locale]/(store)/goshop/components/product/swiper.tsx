//React, Nextjs
import NextImage from 'next/image'

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
//import "swiper/css/pagination";
//import "swiper/css/navigation";

// Types
import { Image } from '@prisma/client'
import { useEffect, useRef } from 'react'

export default function ProductCardImageSwiper({
  images,
}: {
  images: Image[]
}) {
  const swiperRef = useRef<any>(null)
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.autoplay.stop()
    }
  }, [swiperRef])
  return (
    <div
      className="relative mb-2 w-full h-[200px] bg-white contrast-[90%] rounded-2xl overflow-hidden"
      onMouseEnter={() => {
        swiperRef.current.swiper.autoplay.start()
      }}
      onMouseLeave={() => {
        swiperRef.current.swiper.autoplay.stop()
        swiperRef.current.swiper.slideTo(0)
      }}
    >
      <Swiper ref={swiperRef} modules={[Autoplay]} autoplay={{ delay: 500 }}>
        {images.map((img) => (
          <SwiperSlide key={img.id}>
            <NextImage
              src={img.url}
              alt=""
              width={400}
              height={400}
              className="block object-cover h-[200px] w-48 sm:w-[192px]"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
