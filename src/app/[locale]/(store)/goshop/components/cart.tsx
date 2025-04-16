'use client'

import { Link } from '@/navigation'
import { CartIcon } from './icons'
import { useCartStore } from '@/cart-store/useCartStore'

export default function Cart() {
  // Get total items in the cart
  const totalItems = useCartStore((state) => state.totalItems)
  return (
    <div className="relative flex h-11 items-center px-2 cursor-pointer">
      <Link href="/goshop/cart" className="flex items-center ">
        <span className="text-[32px] inline-block">
          <CartIcon />
        </span>
        <div className="ml-1">
          <div className="min-h-4 min-w-6 -mt-1.5">
            <span className="inline-block text-xs text-primary bg-muted-foreground/40 backdrop-blur-sm leading-4 rounded-lg text-center font-bold min-h-4 px-1 min-w-6">
              {totalItems}
            </span>
          </div>
          <b className="text-xs font-bold text-wrap leading-4">Cart</b>
        </div>
      </Link>
    </div>
  )
}
