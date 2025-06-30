import { cn } from '@/lib/utils'
import { FC } from 'react'

interface Spec {
  name: string
  value: string
}

interface Props {
  specs: {
    product: Spec[]
    variant: Spec[] | undefined
  }
}

const ProductSpecs: FC<Props> = ({ specs }) => {
  const { product, variant = [] } = specs
  const newSpecs = [...product, ...variant]
  return (
    <div className="pt-6">
      {/* Title */}
      <div className="h-12">
        <h2 className="  text-2xl font-bold">Specifications</h2>
      </div>
      {/* Product Specs Table */}
      <SpecTable data={newSpecs} />
    </div>
  )
}

export default ProductSpecs

const SpecTable = ({
  data,
  noTopBorder,
}: {
  data: Spec[]
  noTopBorder?: boolean
}) => {
  return (
    <ul
      className={cn('bg-muted rounded-md border grid md:grid-cols-2', {
        'border-t-0': noTopBorder,
      })}
    >
      {data.map((spec, i) => (
        <li
          key={i}
          className={cn('flex border-t', {
            'border-t-0': i === 0,
            // 'bg-background': i % 2 === 0,
          })}
        >
          <div className="float-left text-sm leading-7 relative flex items-center">
            <div className="p-4 rounded-md  min-w-44">
              <span className="leading-5 ">{spec.name}</span>
            </div>
            <div className="w-full p-4  bg-background rounded-md flex-1 break-words leading-5">
              <span className="leading-5 w-full flex-1  ">{spec.value}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
