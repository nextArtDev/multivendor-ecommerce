'use client'

import { Country, Province, ShippingAddress } from '@prisma/client'
import { FC, Suspense, useEffect, useState } from 'react'
import UserShippingAddresses from '../shipping/shipping-addresses/shipping-addresses'
import CountryNote from '../country-note'
import CheckoutProductCard from './checkout-product'
import PlaceOrderCard from './place-order'
import { CartWithCartItemsType, UserShippingAddressType } from '../../types'
import { updateCheckoutProductstWithLatest } from '../../lib/queries/user'

interface Props {
  cart: CartWithCartItemsType
  countries: Country[]
  provinces: Province[]
  addresses: UserShippingAddressType[]
  userCountry: Partial<Country>
}

const CheckoutContainer: FC<Props> = ({
  cart,
  countries,
  addresses,
  userCountry,
  provinces,
}) => {
  // console.log({ countries })
  const [cartData, setCartData] = useState<CartWithCartItemsType>(cart)

  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddress | null>(null)

  // const activeCountry = userCountry
  const activeCountry = addresses.find(
    (add) => add.countryId === selectedAddress?.countryId
  )?.country

  const { cartItems } = cart

  useEffect(() => {
    const hydrateCheckoutCart = async () => {
      const updatedCart = await updateCheckoutProductstWithLatest(
        cartItems,
        activeCountry
      )
      setCartData(updatedCart)
    }

    if (cartItems.length > 0) {
      hydrateCheckoutCart()
    }
  }, [activeCountry])
  return (
    <div className=" w-full flex flex-col gap-y-2 lg:flex-row">
      <div className="space-y-2 lg:flex-1">
        <UserShippingAddresses
          addresses={addresses}
          countries={countries}
          provinces={provinces}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
        />

        <CountryNote
          country={activeCountry ? activeCountry.name : userCountry.name}
        />
        {cartData.cartItems.map((product) => (
          <CheckoutProductCard
            key={product.variantId}
            product={product}
            isDiscounted={cartData.coupon?.storeId === product.storeId}
          />
        ))}
      </div>
      <PlaceOrderCard
        cartData={cartData}
        setCartData={setCartData}
        shippingAddress={selectedAddress}
      />
    </div>
  )
}

export default CheckoutContainer
