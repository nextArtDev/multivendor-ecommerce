'use server'
import countries from '@/constants/countries.json'
interface Country {
  name: string
  code: string
  city: string
  region: string
  //   loc?: string
}
const DEFAULT_COUNTRY: Country = {
  name: 'Iran, Islamic Republic Of',
  code: 'IR',
  city: '',
  region: '',
  //   loc: '',
}

interface IPInfoResponse {
  country: string
  city: string
  region: string
  //   loc?: string
}
export async function getUserCountry(req: Request): Promise<Country> {
  let userCountry: Country = DEFAULT_COUNTRY

  // If geo data is available (in production on Vercel as an edge function)
  const geo = (req as any).geo // For edge functions in Vercel
  if (geo) {
    userCountry = {
      name: geo.country || DEFAULT_COUNTRY.name,
      code: geo.country || DEFAULT_COUNTRY.code,
      city: geo.city || DEFAULT_COUNTRY.city,
      region: geo.region || DEFAULT_COUNTRY.region,
      //   loc: geo?.loc || '',
    }
  } else {
    // Fallback to IPInfo API on localhost or non-edge environments
    try {
      const response = await fetch(
        `https://ipinfo.io/?token=${process.env.IPINFO_TOKEN}`
      )
      if (response.ok) {
        const data = (await response.json()) as IPInfoResponse
        userCountry = {
          name:
            countries.find((c) => c.code === data.country)?.name ||
            data.country ||
            DEFAULT_COUNTRY.name,
          code: data.country || DEFAULT_COUNTRY.code,
          city: data.city || DEFAULT_COUNTRY.city,
          region: data.region || DEFAULT_COUNTRY.region,
          //   loc: data?.loc,
        }
      }
    } catch (error) {
      // Handle error if necessary
      console.log(error)
    }
  }

  return userCountry
}

export const getShippingDatesRange = (
  minDays: number,
  maxDays: number,
  date?: Date
): { minDate: string; maxDate: string } => {
  // Get the current date
  const currentDate = date ? new Date(date) : new Date()

  // Calculate minDate by adding minDays to current date
  const minDate = new Date(currentDate)
  minDate.setDate(currentDate.getDate() + minDays)

  // Calculate maxDate by adding maxDays to current date
  const maxDate = new Date(currentDate)
  maxDate.setDate(currentDate.getDate() + maxDays)

  // Return an object containing minDate and maxDate
  return {
    minDate: minDate.toDateString(),
    maxDate: maxDate.toDateString(),
  }
}
