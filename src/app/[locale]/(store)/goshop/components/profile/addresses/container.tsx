'use client'

import { Country, ShippingAddress } from '@prisma/client'
import { FC, useState } from 'react'
import UserShippingAddresses from '../../shipping/shipping-addresses/shipping-addresses'
import { UserShippingAddressType } from '../../../types'

interface Props {
  addresses: UserShippingAddressType[]
  countries: Country[]
}

const AddressContainer: FC<Props> = ({ addresses, countries }) => {
  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddress | null>(null)
  return (
    <div className="w-full">
      <UserShippingAddresses
        addresses={addresses}
        countries={countries}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
      />
    </div>
  )
}

export default AddressContainer
