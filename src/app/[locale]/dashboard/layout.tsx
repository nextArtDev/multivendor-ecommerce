import { currentRole } from '@/lib/auth'
import ModalProvider from '@/providers/modal-provider'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const userRole = await currentRole()
  if (userRole !== 'SELLER') return notFound()

  return (
    <div>
      <ModalProvider>{children}</ModalProvider>
    </div>
  )
}
