'use server'

import { headers } from 'next/headers'
import { signOut } from '../../../auth'
import { redirect } from 'next/navigation'

export const logout = async () => {
  // some server stuff
  await signOut()
}
export const SignOut = async () => {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const redirectTo = await signOut({ redirect: false })
  redirect(`/${locale}${redirectTo.redirect}`)
}
