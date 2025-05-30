// import { AppealIcon, ArrowIcon, DollarIcon } from "@/components/store/icons";
import UnpaidImg from '../../../../../../../public/assets/images/unpaid.avif'
// import UnpaidImg from '@/public/assets/images/unpaid.avif'
import ToBeShippedImg from '../../../../../../../public/assets/images/to-be-shipped.avif'
import ShippedImg from '../../../../../../../public/assets/images/shipped.avif'
import ToBeReviewedImg from '../../../../../../../public/assets/images/to-de-reviewed.webp'
import Image from 'next/image'
import { AppealIcon, ArrowIcon, DollarIcon } from '../icons'
import { Link } from '@/navigation'
export default function OrdersOverview() {
  return (
    <div className="mt-4   p-4 border shadow-sm">
      <div className="flex items-center border-b">
        <div className="inline-block flex-1 py-3 text-xl font-bold">
          My Orders
        </div>
        <Link href="/goshop/profile/orders">
          <div className="flex items-center  text-sm cursor-pointer">
            View All
            <span className="ml-2 text-lg inline-block">
              <ArrowIcon />
            </span>
          </div>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8">
        {menu.map((item) => (
          <Link key={item.link} href={item.link}>
            <div className="relative w-full flex flex-col justify-center items-center cursor-pointer">
              <Image
                src={item.img}
                alt={item.title}
                width={100}
                height={100}
                className="w-14 h-14 object-cover mix-blend-hard-light rounded-sm"
              />
              <div className="">{item.title}</div>
            </div>
          </Link>
        ))}
      </div>
      <div className="relative flex items-center py-4 border-t cursor-pointer">
        <span className="text-2xl inline-block">
          <AppealIcon />
        </span>
        <div className="ml-1.5 ">My appeal</div>
        <span className="absolute right-0  text-lg">
          <ArrowIcon />
        </span>
      </div>
      <div className="relative flex items-center py-4 border-t cursor-pointer">
        <span className="text-2xl inline-block">
          <DollarIcon />
        </span>
        <div className="ml-1.5 ">In dispute</div>
        <span className="absolute right-0  text-lg">
          <ArrowIcon />
        </span>
      </div>
    </div>
  )
}
const menu = [
  {
    title: 'Unpaid',
    img: UnpaidImg,
    link: '/goshop/profile/orders/unpaid',
  },
  {
    title: 'To be shipped',
    img: ToBeShippedImg,
    link: '/goshop/profile/orders/toShip',
  },
  {
    title: 'Shipped',
    img: ShippedImg,
    link: '/goshop/profile/orders/shipped',
  },
  {
    title: 'Delivered',
    img: ToBeReviewedImg,
    link: '/goshop/profile/orders/delivered',
  },
]
