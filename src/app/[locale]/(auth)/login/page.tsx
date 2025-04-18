import { LoginForm } from '@/components/auth/login-form'
import { redirect } from '@/navigation'

import React from 'react'
import { auth } from '../../../../auth'
import { headers } from 'next/headers'

async function page() {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const session = await auth()
  // if (session?.user.id) return redirect(`${locale}/`)
  if (session?.user.id) return redirect(`/`)

  return <LoginForm />
}

export default page
