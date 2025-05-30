'use client'
import { useRouter } from '@/navigation'
import { FC, useEffect, useState } from 'react'
import StoreCard from '../../store/store-card'
import Pagination from '../../pagination'

interface Props {
  stores: {
    id: string
    url: string
    name: string
    logo: string
    followersCount: number
    isUserFollowingStore: boolean
  }[]
  page: number
  totalPages: number
}

const FollowingContainer: FC<Props> = ({ stores, page, totalPages }) => {
  const router = useRouter()
  const [currentPage, setPage] = useState<number>(page)

  useEffect(() => {
    if (currentPage !== page) {
      router.push(`/goshop/profile/following/${currentPage}`)
    }
  }, [currentPage, page])
  return (
    <div>
      <div className="flex flex-wrap pb-16">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
      <Pagination
        // page={page}
        // setPage={setPage}
        totalPages={totalPages}
      />
    </div>
  )
}

export default FollowingContainer
