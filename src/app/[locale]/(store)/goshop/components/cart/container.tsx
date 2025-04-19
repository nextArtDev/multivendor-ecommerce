'use client'
import { useCartStore } from '@/cart-store/useCartStore'
import useFromStore from '@/hooks/useFromStore'

import React, { useEffect, useState, useRef } from 'react'
import CartHeader from './car-header'
import CartSummary from './summary'
import EmptyCart from './empty-cat'
import { Country } from '../header/header'
import { CartProductType } from '../../types'
import { SecurityPrivacyCard } from '../shipping/returns-security-privacy-card'
import CartProduct from './cart-product'
import FastDelivery from './fast-delivery'
import { updateCartWithLatest } from '../../lib/queries/user'
// import CartProduct from "../cards/cart-product";
// import FastDelivery from "../cards/fast-delivery";
// import { SecurityPrivacyCard } from "../product-page/returns-security-privacy-card";
// import { updateCartWithLatest } from "@/queries/user";
// import CountryNote from "../shared/country-note";

export default function CartContainer({
  userCountry,
}: {
  userCountry: Country
}) {
  const cartItems = useFromStore(useCartStore, (state) => state.cart)
  const setCart = useCartStore((state) => state.setCart)

  const [loading, setLoading] = useState<boolean>(false)
  const [isCartLoaded, setIsCartLoaded] = useState<boolean>(false)
  const [selectedItems, setSelectedItems] = useState<CartProductType[]>([])
  const [totalShipping, setTotalShipping] = useState<number>(0)

  // Ref to track if the component has mounted
  const hasMounted = useRef(false)

  useEffect(() => {
    if (cartItems !== undefined) {
      setIsCartLoaded(true) // Flag indicating cartItems has finished loading
    }
  }, [cartItems])

  useEffect(() => {
    const loadAndSyncCart = async () => {
      if (!cartItems) return
      try {
        setLoading(true)
        const updatedCart = await updateCartWithLatest(cartItems)
        setCart(updatedCart)
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }

    // Run only when userCountry changes and after the initial mount
    if (hasMounted.current && cartItems?.length) {
      loadAndSyncCart()
    } else {
      hasMounted.current = true // Set the ref to true after the first render
    }
  }, [userCountry])

  return (
    <div>
      {cartItems && cartItems.length > 0 ? (
        <>
          <div className="text-black min-h-[calc(100vh-65px)] px-2">
            <div className="max-w-[1200px] mx-auto py-4 flex flex-col gap-y-4 lg:flex-row">
              <div className="min-w-0 flex-1">
                {/* Cart header */}
                <CartHeader
                  cartItems={cartItems}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                />
                {/* <div className="my-2">
                  <CountryNote country={userCountry.name} />
                </div> */}
                <div className="h-auto overflow-x-hidden overflow-auto mt-2">
                  {/* Cart items */}
                  {cartItems.map((product) => (
                    <CartProduct
                      key={`${product.productSlug}-${product.variantSlug}`}
                      product={product}
                      selectedItems={selectedItems}
                      setSelectedItems={setSelectedItems}
                      setTotalShipping={setTotalShipping}
                      userCountry={userCountry}
                    />
                  ))}
                </div>
              </div>
              {/* Cart side */}
              <div className="sticky top-4 lg:ml-5 w-full lg:w-[380px] max-h-max">
                {/* Cart summary */}
                <CartSummary
                  cartItems={cartItems}
                  shippingFees={totalShipping}
                />
                <div className="mt-2 p-4  px-6">
                  <FastDelivery />
                </div>
                <div className="mt-2 p-4  px-6">
                  <SecurityPrivacyCard />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <EmptyCart />
      )}
    </div>
  )
}
