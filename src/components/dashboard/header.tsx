// import { UserButton } from '../auth/user-button'
import { ModeToggle } from '../ui/mode-toggle'
// import { SidebarTrigger } from '../ui/sidebar'

export default function Header() {
  return (
    <div className="fixed   top-0 right-0 p-4 bg-background/80 backdrop-blur-md flex gap-4 items-center border-b-[1px]">
      <div className="flex w-full items-center justify-between gap-2 ">
        {/* <UserButton afterSignOutUrl="/" /> */}
        {/* <SidebarTrigger className=" md:ml-[250px]" /> */}
        <div>
          <ModeToggle />
          {/* <UserButton /> */}
        </div>
      </div>
    </div>
  )
}
