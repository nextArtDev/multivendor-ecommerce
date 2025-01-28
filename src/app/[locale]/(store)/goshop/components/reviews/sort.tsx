import { ChevronDown } from 'lucide-react'
import { Dispatch, FC, SetStateAction } from 'react'
import { ReviewsOrderType } from '../../lib/queries/review'
import { Button } from '@/components/ui/button'

interface Props {
  sort?: ReviewsOrderType | undefined
  setSort: Dispatch<SetStateAction<ReviewsOrderType | undefined>>
}

const ReviewsSort: FC<Props> = ({ sort, setSort }) => {
  return (
    <div className="group w-[120px]">
      {/* Trigger */}
      <Button className="  hover:text-[#fd384f] text-sm py-0.5 text-center inline-flex items-center">
        Sort by&nbsp;
        {sort?.orderBy === 'latest'
          ? 'latest'
          : sort?.orderBy === 'highest'
          ? 'highest'
          : 'default'}
        <ChevronDown className="w-3 ml-1" />
      </Button>
      <div className="z-10 hidden absolute bg-primary/60 backdrop-blur-md shadow w-[120px] group-hover:block">
        <ul className="text-m  ">
          <li onClick={() => setSort(undefined)}>
            <span className="block p-2 text-sm cursor-pointer ">
              Sort by default
            </span>
          </li>
          <li onClick={() => setSort({ orderBy: 'highest' })}>
            <span className="block p-2 text-sm cursor-pointer ">
              Sort by highest
            </span>
          </li>
          <li onClick={() => setSort({ orderBy: 'latest' })}>
            <span className="block p-2 text-sm cursor-pointer ">
              Sort by latest
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ReviewsSort
