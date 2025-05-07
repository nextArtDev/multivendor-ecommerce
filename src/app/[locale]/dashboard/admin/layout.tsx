// React, Next.js
import { ReactNode } from 'react'
import { redirect } from '@/navigation'
import { currentUser } from '@/lib/auth'
import Header from '@/components/dashboard/header'
import Sidebar from '@/components/dashboard/sidebar/sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  // Block non admins from accessing the admin dashboard
  const user = await currentUser()
  if (!user || user.role !== 'ADMIN') redirect('/')
  return (
    <div className="w-full h-full">
      {/* Sidebar */}
      <SidebarProvider>
        <Sidebar isAdmin />

        <SidebarInset>
          {/* Header */}
          <div className="w-full mt-[75px] p-4">
            <Header />
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
