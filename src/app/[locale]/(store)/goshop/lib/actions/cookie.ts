'use server'

import { cookieFormSchema } from '@/components/shared/select-province-form'
import { getCityByProvinceId } from '@/lib/actions/province'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

interface SetCookieFormData {
  errors: {
    provinceId?: string[]
    cityId?: string[]

    _form?: string[]
  }
}

export async function setCityCookie(
  formData: FormData,
  path: string
): Promise<SetCookieFormData> {
  const provinceId = formData.get('provinceId')
  const cityId = formData.get('cityId')

  if (!provinceId || !cityId) {
    return {
      errors: {
        _form: ['شهر در دسترس نیست!'],
      },
    }
  }

  try {
    const province = await prisma.province.findFirst({
      where: {
        id: +provinceId,
      },
    })
    const city = await prisma.city.findFirst({
      where: {
        id: +cityId,
      },
    })

    const cookieStore = await cookies()
    const userLocation = `${province?.name}-${city?.name}`
    // Set the cookie directly
    console.log({ userLocation })
    cookieStore.set('userProvince', JSON.stringify(userLocation), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // Example: 1 week
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }
  revalidatePath(path)
  redirect(path)
}
