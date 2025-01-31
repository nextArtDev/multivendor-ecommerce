import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MoveLeft, MoveRight } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { Dispatch, FC, SetStateAction } from 'react'

interface Props {
  // page: number
  totalPages: number
  // setPage: Dispatch<SetStateAction<number>>
}

const Pagination: FC<Props> = ({ totalPages }) => {
  const [page, setPage] = useQueryState('page')

  const handlePrevious = () => {
    if (!page) setPage(null)
    else if (+page >= 1) {
      setPage(String(Number(page) - 1))
    }
  }

  const handleNext = () => {
    console.log('totalPages', totalPages)
    if (!page) {
      setPage('2')
    } else if (+page < totalPages) {
      setPage(String(Number(page) + 1))
    }
  }
  return (
    <div className="w-full py-0 lg:px-0 sm:px-6 px-4">
      <div className="w-full flex items-center justify-end gap-x-4 border-t border-muted">
        <Button
          onClick={() => handlePrevious()}
          className="flex items-center pt-3 text-gray-600 hover:text-orange-background cursor-pointer"
        >
          <MoveLeft className="w-3" />
          <p className="text-sm ml-3 font-medium leading-none">Previous</p>
        </Button>
        <div className="flex flex-wrap">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'text-sm font-medium leading-none cursor-pointer text-gray-600  hover:text-orange-background  border-t border-transparent pt-3 mr-4 px-2',
                {
                  'text-orange-background border-orange-background':
                    page && i === +page,
                }
              )}
              onClick={() => setPage(String(Number(page) + 1))}
            >
              {page && +page + 1}
            </span>
          ))}
        </div>
        <Button
          onClick={() => handleNext()}
          className="flex items-center pt-3 text-gray-600 hover:text-orange-background cursor-pointer"
        >
          <p className="text-sm font-medium leading-none mr-3">Next</p>
          <MoveRight className="w-3" />
        </Button>
      </div>
    </div>
  )
}

export default Pagination
