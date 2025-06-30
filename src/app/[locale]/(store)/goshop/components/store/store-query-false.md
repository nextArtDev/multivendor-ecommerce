store card:

```ts
'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link, usePathname } from '@/navigation'
import { Check, MessageSquareMore, Plus } from 'lucide-react'
import Image from 'next/image'
import { FC, useActionState } from 'react'
import { getStoreFollowingInfo } from '../../lib/queries/product'
import { followStore } from '../../lib/actions/user'
import { useQuery } from '@tanstack/react-query'

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

const StoreCard: FC<Props> = ({ store }) => {
  const { id, name, logo, url } = store
  const path = usePathname()

  const [state, followAction, pending] = useActionState(
    followStore.bind(null, path, id),
    {
      errors: {},
    }
  )

  const { data, isLoading } = useQuery({
    queryKey: ['store-following', id],
    queryFn: () => getStoreFollowingInfo(id),
    enabled: !!id,
    initialData: {
      isUserFollowingStore: store.isUserFollowingStore,
      followersCount: store.followersCount,
    },
  })

  const following = data?.isUserFollowingStore ?? false
  const followersCount = data?.followersCount ?? 0

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
              {!!followersCount && (
                <span>
                  <strong>{followersCount}</strong>
                  <strong> Followers</strong>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex">
          <form action={followAction}>
            <Button
              type="submit"
              variant={following ? 'outline' : 'default'}
              className={cn(
                'flex items-center border rounded-full cursor-pointer text-base font-bold h-9 mx-2 px-4'
              )}
              disabled={pending || isLoading}
            >
              {following ? (
                <Check className="w-4 me-1" />
              ) : (
                <Plus className="w-4 me-1" />
              )}
              <span>{following ? 'Following' : 'Follow'}</span>
            </Button>
          </form>
          <Button className="flex items-center border rounded-full cursor-pointer text-base font-bold h-9 mx-2 px-4">
            <MessageSquareMore className="w-4 me-2" />
            <span>Message</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StoreCard

```