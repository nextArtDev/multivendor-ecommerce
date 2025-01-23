import { Button, buttonVariants } from '@/components/ui/button'
// import { Button } from "@/components/store/ui/button";
import { Separator } from '@/components/ui/separator'
import { SignOut } from '@/lib/actions/auth/logout'
import { currentUser } from '@/lib/auth'
import { getUserById } from '@/lib/queries/auth/user'
import { cn } from '@/lib/utils'
// import { SignOutButton, UserButton } from "@clerk/nextjs";
// import { currentUser } from "@clerk/nextjs/server";
import { ChevronDown, UserIcon } from 'lucide-react'
import Image from 'next/image'

import { MessageIcon, OrderIcon, WishlistIcon } from './icons'
import { UserButton } from '@/components/auth/user-button'
import { Link } from '@/navigation'

export default async function UserMenu() {
  // Get the current user
  const authUser = await currentUser()

  const user = await getUserById(authUser?.id)

  return (
    <div className="relative group px-2 text-foreground">
      {/* Trigger */}
      <div>
        {user ? (
          user?.image?.url ? (
            <Image
              src={user.image?.url || ''}
              alt={user.name!}
              width={40}
              height={40}
              className="w-10 h-10 object-cover rounded-full"
            />
          ) : (
            <svg
              viewBox="0 0 1024 1024"
              width="40px"
              height="40px"
              fill="currentColor"
              aria-hidden="false"
              focusable="false"
            >
              <path d="M512 126.357333a189.866667 189.866667 0 1 0 189.866667 189.866667 189.866667 189.866667 0 0 0-189.866667-189.866667z m-125.866667 189.866667a125.866667 125.866667 0 1 1 251.733334 0 125.866667 125.866667 0 0 1-251.733334 0zM512 650.666667c138.026667 0 236.074667 72.448 273.152 192H238.848c37.077333-119.552 135.146667-192 273.152-192z m0-64c-171.541333 0-298.325333 96.981333-339.349333 254.805333-9.002667 34.666667 18.346667 65.194667 51.093333 65.194667h576.512c32.768 0 60.096-30.506667 51.093333-65.194667C810.325333 683.648 683.52 586.666667 512 586.666667z"></path>
            </svg>
          )
        ) : (
          <div className="flex h-11 items-center py-0 mx-2 cursor-pointer">
            <span className="text-2xl">
              <UserIcon />
            </span>
            <div className="ml-1">
              <span className="block text-xs  leading-3">Welcome</span>
              <b className="font-bold text-xs  leading-4">
                <span>Sign in / Register</span>
                <span className=" scale-[60%] align-middle inline-block">
                  <ChevronDown />
                </span>
              </b>
            </div>
          </div>
        )}
      </div>
      {/* Content */}
      <div
        className={cn(
          'hidden absolute top-0 -left-20 group-hover:block cursor-pointer',
          {
            '-left-[200px] lg:-left-[138px]': user,
          }
        )}
      >
        <div className="relative left-2 mt-10 right-auto bottom-auto pt-2.5   p-0 text-sm z-40">
          {/* Triangle */}
          <div className="w-0 h-0 absolute left-[149px] top-1 right-24 !border-l-[10px] !border-l-transparent !border-r-[10px] !border-r-transparent !border-b-[10px] border-b-foreground/20 backdrop-blur-sm" />
          {/* Menu */}
          <div className="rounded-3xl bg-foreground/20 backdrop-blur-md text-sm   shadow-lg">
            <div className="w-[305px]">
              <div className="pt-5 px-6 pb-0">
                {user ? (
                  <div className="user-avatar w-full flex flex-col items-center justify-center gap-2">
                    <UserButton />
                    {user.name}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link
                      href="/login"
                      className=" w-full flex items-center justify-center"
                    >
                      <Button>Sign in</Button>
                    </Link>
                    <Link
                      href="/register"
                      className="h-10 text-sm hover:underline  flex items-center justify-center cursor-pointer"
                    >
                      Register
                    </Link>
                  </div>
                )}
                {user && (
                  <div className="my-3  w-full flex items-center justify-center text-center text-sm  cursor-pointer">
                    <form action={SignOut} className="w-full">
                      <Button
                        className="w-fit   py-4 px-2 h-4 justify-start"
                        variant="link"
                      >
                        Sign out
                      </Button>
                    </form>
                  </div>
                )}
                <Separator />
              </div>
              {/* Links */}
              <div className="max-w-[calc(100vh-180px)]   overflow-y-auto overflow-x-hidden pt-0 px-2 pb-4">
                <ul className="grid grid-cols-3 gap-2 py-2.5 ^px-4 w-full">
                  {links.map((item) => (
                    <li key={item.title} className="grid place-items-center">
                      <Link href={item.link} className="space-y-2">
                        <div className="w-14 h-14 rounded-full p-2 grid place-items-center bg-foreground/20 hover:bg-foreground/60 backdrop-blur-sm transition">
                          <span className=" ">{item.icon}</span>
                        </div>
                        <span className="block text-xs">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Separator className="!max-w-[257px] mx-auto" />
                <ul className="  pt-2.5  pb-1   w-[288px]">
                  {extraLinks.map((item, i) => (
                    <li key={i}>
                      <Link
                        className={cn(
                          'w-full text-start text-sm flex flex-col  gap-1  ',
                          buttonVariants({
                            variant: 'link',
                            className: 'w-fit',
                          })
                        )}
                        href={item.link}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const links = [
  {
    icon: <OrderIcon />,
    title: 'My Orders',
    link: '/profile/orders',
  },
  {
    icon: <MessageIcon />,
    title: 'Messages',
    link: '/profile/messages',
  },
  {
    icon: <WishlistIcon />,
    title: 'WishList',
    link: '/profile/wishlist',
  },
]
const extraLinks = [
  {
    title: 'Profile',
    link: '/profile',
  },
  {
    title: 'Settings',
    link: '/',
  },
  {
    title: 'Become a Seller',
    link: '/become-seller',
  },
  {
    title: 'Help Center',
    link: '',
  },
  {
    title: 'Return & Refund Policy',
    link: '/',
  },
  {
    title: 'Legal & Privacy',
    link: '',
  },
  {
    title: 'Discounts & Offers',
    link: '',
  },
  {
    title: 'Order Dispute Resolution',
    link: '',
  },
  {
    title: 'Report a Problem',
    link: '',
  },
]
