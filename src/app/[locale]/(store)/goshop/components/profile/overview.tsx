import { currentUser } from '@/lib/auth'
import { Link } from '@/navigation'
import { Eye, Heart, Puzzle, Rss, WalletCards } from 'lucide-react'
// import Image from "next/image";

export default async function ProfileOverview() {
  const user = await currentUser()
  if (!user) return
  return (
    <div className="w-full">
      <div className=" p-4 border shadow-sm">
        <div className="flex items-center">
          {/* <Image
            src={user.imageUrl}
            alt={user.fullName!}
            width={200}
            height={200}
            className="w-14 h-14 rounded-full object-cover"
          /> */}
          <div className="flex-1 ml-4   text-xl font-bold capitalize ">
            {user.name?.toLowerCase()}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4">
          {menu.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              className="w-36 relative flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="text-3xl">
                <span>{item.icon}</span>
              </div>
              <div className="mt-2">{item.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

const menu = [
  {
    title: 'Wishlist',
    icon: <Heart />,
    link: '/goshop/profile/wishlist',
  },
  {
    title: 'Following',
    icon: <Rss />,
    link: '/goshop/profile/following/1',
  },
  {
    title: 'Viewed',
    icon: <Eye />,
    link: '/goshop/profile/history/1',
  },
  {
    title: 'Coupons',
    icon: <Puzzle />,
    link: '/goshop/profile/coupons',
  },
  {
    title: 'Shopping credit',
    icon: <WalletCards />,
    link: '/goshop/profile/credit',
  },
]
