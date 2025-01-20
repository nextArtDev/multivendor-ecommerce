import Header from '@/components/amazon/header'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'

// Toaster

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="overflow-hidden">
        <Header />
        {children}
      </div>
      <Toaster position="top-center" richColors />
    </div>
  )
}
