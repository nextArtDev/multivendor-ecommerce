import { Size } from '@prisma/client'
// import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Dispatch, FC, SetStateAction, useEffect } from 'react'
import { CartProductType } from '../../types'

interface Props {
  sizes: Size[]
  sizeId: string | undefined
  handleChange: (property: keyof CartProductType, value: unknown) => void
  setSizeId: Dispatch<SetStateAction<string>>
}

const SizeSelector: FC<Props> = ({
  sizeId,
  setSizeId,
  sizes,
  handleChange,
}) => {
  // const pathname = usePathname()
  // const { replace, refresh } = useRouter()
  // const searchParams = useSearchParams()
  // const params = new URLSearchParams(searchParams)

  useEffect(() => {
    if (sizeId) {
      const search_size = sizes.find((s) => s.id === sizeId)
      if (search_size) {
        handleCartProductToBeAddedChange(search_size)
      }
    } else {
    }
  }, [sizeId, sizes])

  const handleSelectSize = (size: Size) => {
    setSizeId(size.id)
    handleCartProductToBeAddedChange(size)
  }

  const handleCartProductToBeAddedChange = (size: Size) => {
    handleChange('sizeId', size.id)
    handleChange('size', size.size)
  }

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
