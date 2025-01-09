import ModalProvider from '@/providers/modal-provider'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <ModalProvider>{children}</ModalProvider>
    </div>
  )
}
