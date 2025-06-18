import { Size } from '@prisma/client'
// import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Dispatch, FC, SetStateAction, useEffect } from 'react'
import { CartProductType } from '../../types'
import { useQueryState } from 'nuqs'
import { useSearchParams } from 'next/navigation'
import { usePathname, useRouter } from '@/navigation'

interface Props {
  sizes: Size[]
  sizeId: string | undefined
  handleChange: (property: keyof CartProductType, value: unknown) => void
  // setSizeId: Dispatch<SetStateAction<string>>
}

const SizeSelector: FC<Props> = ({
  sizeId,
  // setSizeId,
  sizes,
  handleChange,
}) => {
  const pathname = usePathname()
  const { replace } = useRouter()
  const searchParams = useSearchParams()
  // const sizeId = searchParams.get('sizeId')
  const params = new URLSearchParams(searchParams)

  const search_size = sizes.find((s) => s.id === sizeId)

  const handleSelectSize = (size: Size) => {
    params.set('sizeId', size.id || sizeId || '')
    replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    })

    handleChange('sizeId', sizeId)
    handleChange('size', search_size)
    // handleCartProductToBeAddedChange(size)
  }

  // const handleCartProductToBeAddedChange = (size: Size) => {
  //   handleChange('sizeId', sizeId)
  //   handleChange('size', size.size)
  // }

  return (
    <div className="flex flex-wrap gap-4">
      {sizes.map((size) => (
        <span
          key={size.size}
          className={`border rounded-full px-5 py-1 cursor-pointer transition-all hover:bg-muted-foreground hover:text-background ${
            size.id === sizeId ? 'bg-primary text-background' : ''
          }`}
          onClick={() => handleSelectSize(size)}
        >
          {size.size}
        </span>
      ))}
    </div>
  )
}

export default SizeSelector
