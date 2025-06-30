import { Loader2, MapPin } from 'lucide-react'
import { FC } from 'react'

interface Props {
  countryName?: string
  countryCode?: string
  city?: string
  cityName?: string
  provinceName?: string
}

const ShipTo: FC<Props> = ({
  cityName,
  provinceName,
  countryName,
  countryCode,
  city,
}) => {
  return (
    <div className="flex justify-between h-7">
      <div className="flex items-center font-bold mr-2 whitespace-nowrap">
        <span>Ship to</span>
      </div>
      <div className="flex items-center overflow-hidden">
        <MapPin className="w-4 mb-1 stroke-main-primary" />
        {/* {countryName},{city && `${city},`}
          {countryCode}  */}

        <span className="text-main-secondary text-sm cursor-pointer max-w-[200px] overflow-hidden pl-0.5 text-ellipsis whitespace-nowrap">
          {cityName} , {provinceName}
          {/* {countryCode} */}
        </span>
      </div>
    </div>
  )
}

export default ShipTo
