import countries from '@/constants/countries.json'
import { prisma } from './prisma'

export async function seedCountries() {
  try {
    for (const country of countries) {
      await prisma.country.upsert({
        where: {
          name: country.name,
        },
        create: {
          name: country.name,
          code: country.code,
        },
        update: {
          name: country.name,
          code: country.code,
        },
      })
    }
  } catch (error) {}
}
