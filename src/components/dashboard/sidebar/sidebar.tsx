// React, Next.js
import { FC } from 'react'

// Clerk
// import { currentUser } from "@clerk/nextjs/server";

// Custom Ui Components

import UserInfo from './user-info'
import SidebarNavAdmin from './nav-admin'
import SidebarNavSeller from './nav-seller'

// Menu links
import {
  SellerDashboardSidebarOptions,
  adminDashboardSidebarOptions,
} from '@/constants/data'

// Prisma models
// import { Store } from "@prisma/client";
import StoreSwitcher from './store-switcher'
import { currentUser } from '@/lib/auth'
import Logo from '@/components/shared/logo'
import { prisma } from '@/lib/prisma'
import {
  Sidebar as ShadSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Store } from '@prisma/client'

interface SidebarProps {
  isAdmin?: boolean
  stores?: Store[]
}

const Sidebar: FC<SidebarProps> = async ({ isAdmin, stores }) => {
  const authUser = await currentUser()
  const user = await prisma.user.findFirst({
    where: { id: authUser?.id },
    include: { image: true },
  })
  return (
    <ShadSidebar>
      {/* <div className="w-[300px] border-r h-screen p-4 flex flex-col fixed top-0 left-0 bottom-0"> */}
      <SidebarHeader className="py-0 my-0 scale-75">
        <Logo width="100%" height="180px" />
      </SidebarHeader>
      <SidebarContent>
        <div className="w-full px-2 flex items-center justify-center">
          {!isAdmin && stores && <StoreSwitcher stores={stores} />}
        </div>
        {isAdmin ? (
          <SidebarNavAdmin menuLinks={adminDashboardSidebarOptions} />
        ) : (
          <SidebarNavSeller menuLinks={SellerDashboardSidebarOptions} />
        )}
      </SidebarContent>
      <SidebarFooter className="py-0 my-0">
        <span className=" " />
        {user && <UserInfo user={user} />}
        {/* {!isAdmin && stores && <StoreSwitcher stores={stores} />} */}
      </SidebarFooter>
    </ShadSidebar>
  )
}

export default Sidebar
