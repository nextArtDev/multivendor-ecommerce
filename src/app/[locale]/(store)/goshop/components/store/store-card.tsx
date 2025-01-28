'use client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link, useRouter } from '@/navigation'
// import { getStoreFollowingInfo } from '@/queries/product-optimized'
// import { followStore } from '@/queries/user'

import { Check, MessageSquareMore, Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

import { FC, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Props {
  store: {
    id: string
    url: string
    name: string
    logo?: string
    followersCount: number
    isUserFollowingStore: boolean
  }
  checkForFollowing?: boolean
}

const StoreCard: FC<Props> = ({ store, checkForFollowing }) => {
  const { id, name, logo, url, followersCount, isUserFollowingStore } = store
  const [following, setFollowing] = useState<boolean>(isUserFollowingStore)
  const [storeFollowersCount, setStoreFollowersCount] =
    useState<number>(followersCount)
  const user = useSession()
  const router = useRouter()

  useEffect(() => {
    const getDetails = async () => {
      try {
        // const res = await getStoreFollowingInfo(id)
        // setFollowing(res.isUserFollowingStore)
        // setStoreFollowersCount(res.followersCount)
      } catch (error) {
        console.log(error)
      }
    }
    getDetails()
  }, [])

  const handleStoreFollow = async () => {
    if (!user.data?.user || !user.data?.user.id) router.push('/sign-in')
    try {
      //   const res = await followStore(id)
      //   setFollowing(res)
      //   if (res) {
      //     setStoreFollowersCount((prev) => prev + 1)
      //     // toast.success(`You are now following ${name}`);
      //   }
      //   if (!res) {
      //     setStoreFollowersCount((prev) => prev - 1)
      //     // toast.success(`You unfollowed ${name}`);
      //   }
    } catch (error) {
      console.log(error)
      toast.error('Something happend, Try again later !')
    }
  }
  return (
    <div className="w-full">
      <div className="bg-background backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-xl py-3 px-4">
        <div className="flex">
          {logo && (
            <Link href={`/store/${url}`}>
              <Image
                src={logo}
                alt={name}
                width={50}
                height={50}
                className="min-w-12 min-h-12 aspect-square object-cover rounded-full"
              />
            </Link>
          )}
          <div className="mx-2">
            <div className="text-xl font-bold leading-6">
              <Link href={`/store/${url}`} className="text-main-primary">
                {name}
              </Link>
            </div>
            <div className="text-sm leading-5 mt-1">
              <strong>100%</strong>
              <span> Positive Feedback</span>&nbsp;|&nbsp;
              <strong>{storeFollowersCount}</strong>
              <strong> Followers</strong>
            </div>
          </div>
        </div>
        <div className="flex">
          <Button
            variant={following ? 'outline' : 'default'}
            className={cn(
              'flex items-center border rounded-full cursor-pointer text-base font-bold h-9 mx-2 px-4  '
            )}
            onClick={() => handleStoreFollow()}
          >
            {following ? (
              <Check className="w-4 me-1" />
            ) : (
              <Plus className="w-4 me-1" />
            )}
            <span>{following ? 'Following' : 'Follow'}</span>
          </Button>
          <Button className="flex items-center border rounded-full cursor-pointer text-base font-bold h-9 mx-2 px-4  ">
            <MessageSquareMore className="w-4 me-2" />
            <span>Message</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StoreCard
