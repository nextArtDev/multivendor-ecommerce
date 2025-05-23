import { ReactNode } from 'react'
import Header from '../../components/header/header'
import ProfileSidebar from '../../components/profile/sidebar'

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen   ">
      <Header />
      <div className="max-w-container mx-auto flex flex-col lg:flex-row gap-4 p-2 ">
        <ProfileSidebar />
        <div className="w-full flex-1 lg:mt-12">{children}</div>
      </div>
    </div>
  )
}
