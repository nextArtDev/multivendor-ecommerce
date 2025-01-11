// React,Next.js
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import Sidebar from '@/components/dashboard/sidebar/sidebar'
import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Header from '@/components/dashboard/header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default async function SellerStoreDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await currentUser()
  if (!user) {
    redirect('/')
    return // Ensure no further code is executed after redirect
  }

  const stores = await prisma.store.findMany({
    where: {
      userId: user.id,
    },
  })

  return (
    <div className="h-full w-full flex">
      <SidebarProvider>
        <Sidebar stores={stores} />

        <SidebarInset>
          <div className="w-full mt-[75px] p-4">
            <Header />
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
