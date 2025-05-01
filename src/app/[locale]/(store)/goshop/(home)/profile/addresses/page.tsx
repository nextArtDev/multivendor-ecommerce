import { prisma } from '@/lib/prisma'
import AddressContainer from '../../../components/profile/addresses/container'
import { getUserShippingAddresses } from '../../../lib/queries/user'

export default async function ProfileAddressesPage() {
  const addresses = await getUserShippingAddresses()
  const countries = await prisma.country.findMany()
  return (
    <div>
      <AddressContainer addresses={addresses} countries={countries} />
    </div>
  )
}
