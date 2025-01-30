import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { parseAsStringLiteral, useQueryState } from 'nuqs'

const ReviewsSort = () => {
  const sorts = ['latest', 'oldest', 'highest'] as const

  const [sort, setSort] = useQueryState(
    'sort',
    parseAsStringLiteral(sorts) // pass a readonly list of allowed values
      .withDefault('highest')
  )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="">
          Sorting - {sort}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {/* <DropdownMenuLabel>Panel Position</DropdownMenuLabel> */}
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          defaultValue={'highest'}
          value={sort}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-expect-error
          onValueChange={(value) => setSort(value)}
        >
          <DropdownMenuRadioItem value="latest">Latest</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="oldest">Oldest</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="highest">Highest</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ReviewsSort
