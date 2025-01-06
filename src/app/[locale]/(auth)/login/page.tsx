import { LoginForm } from '@/components/auth/login-form'
import { redirect } from '@/navigation'

import React from 'react'
import { auth } from '../../../../../auth'

async function page() {
  const session = await auth()
  if (session?.user.id) return redirect('/')

  return <LoginForm />
}

export default page
