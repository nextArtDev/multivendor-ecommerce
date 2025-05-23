// import { useCartStore } from "@/cart-store/useCartStore";
// import useFromStore from "@/hooks/useFromStore";

import { Size } from '@prisma/client'
import { Minus, Plus } from 'lucide-react'
import { FC, useEffect, useMemo } from 'react'
import { CartProductType } from '../../types'
import useFromStore from '@/hooks/useFromStore'
import { useCartStore } from '@/cart-store/useCartStore'

interface QuantitySelectorProps {
  productId: string
  variantId: string
  sizeId: string | null
  quantity: number
  stock: number
  handleChange: (property: keyof CartProductType, value: any) => void
  sizes: Size[]
}

const QuantitySelector: FC<QuantitySelectorProps> = ({
  handleChange,
  productId,
  quantity,
  sizeId,
  sizes,
  variantId,
  stock,
}) => {
  // Ensure hooks are called at the top level, even before conditions or early returns
  const cart = useFromStore(useCartStore, (state) => state.cart)
  // Avoid conditional hook calls
  const maxQty =
    cart && sizeId
      ? (() => {
          const search_product = cart?.find(
            (p) =>
              p.productId === productId &&
              p.variantId === variantId &&
              p.sizeId === sizeId
          )
          return search_product
            ? search_product.stock - search_product.quantity
            : stock
        })()
      : stock // Default to stock if no cart or sizeId

  // useEffect hook to handle changes when sizeId updates
  useEffect(() => {
    handleChange('quantity', 1)
  }, [sizeId])

  // Function to handle increasing the quantity of the product
  const handleIncrease = () => {
    console.log({ cart })
    if (quantity < maxQty) {
      // if (quantity < stock) {
      handleChange('quantity', quantity + 1)
    }
  }

  // Function to handle decreasing the quantity of the product
  const handleDecrease = () => {
    if (quantity > 1) {
      handleChange('quantity', quantity - 1)
    }
  }

  return (
    <div className="w-full py-2 px-3  border   rounded-lg">
      <div className="w-full flex justify-between items-center gap-x-5">
        <div className="grow">
          <span className="block text-xs ">Select quantity</span>
          <span className="block text-xs text-gray-500">
            {maxQty !== stock &&
              `(You already have ${
                stock - maxQty
              } pieces of this product in cart)`}
          </span>
          <input
            type="number"
            className="w-full p-0 bg-transparent border-0 focus:outline-0  "
            min={1}
            value={maxQty <= 0 ? 0 : quantity}
            max={maxQty}
            readOnly
          />
        </div>
        <div className="flex justify-end items-center gap-x-1.5">
          <button
            className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-primary  shadow-sm focus:outline-none focus:bg-muted disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleDecrease}
            disabled={quantity === 1}
          >
            <Minus className="w-3" />
          </button>
          <button
            className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-primary  shadow-sm focus:outline-none focus:bg-muted disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleIncrease}
            disabled={quantity === stock}
          >
            <Plus className="w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuantitySelector
