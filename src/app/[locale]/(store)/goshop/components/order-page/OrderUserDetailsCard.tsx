import { UserShippingAddressType } from '../../types'

export default function OrderUserDetailsCard({
  details,
}: {
  details: UserShippingAddressType
}) {
  const {
    // user,
    firstName,
    lastName,
    address1,
    address2,

    country,
    phone,
    city,
    province,
    zip_code,
  } = details
  // const { picture, email } = user
  return (
    <div>
      <section className="p-2 shadow-sm w-full">
        {/* <div className="w-fit mx-auto">
          <Image
            src={picture}
            alt="profile pic"
            width={100}
            height={100}
            className="rounded-full w-28 h-28 object-cover"
          />
        </div> */}
        <div className="  mt-2 space-y-2">
          <h2 className="text-center font-bold text-2xl tracking-wide capitalize">
            {firstName} {lastName}
          </h2>
          {/* <h6 className="text-center py-2 border-t border-neutral-400 border-dashed">
            {email}
          </h6> */}
          <h6 className="text-center">{phone}</h6>
          <p className="text-sm bg-muted rounded-md text-center px-1 py-2 border-t border-neutral-400 border-dashed">
            {address1}, {address2} ,{city.name} , {province.name}, {zip_code},{' '}
            {country.name}
          </p>
        </div>
      </section>
    </div>
  )
}
