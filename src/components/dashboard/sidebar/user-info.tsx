import { LogoutButton } from '@/components/auth/logout-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Image, User } from '@prisma/client'
import { ExitIcon } from '@radix-ui/react-icons'
import { UserIcon } from 'lucide-react'

import React from 'react'

export default function UserInfo({
  user,
}: {
  user: (User & { image: Image | null }) | null
}) {
  const role = user?.role?.toString()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="w-full mt-5 mb-4 flex items-center justify-between py-10"
          variant="ghost"
        >
          <div className="flex items-center text-left gap-2">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={user?.image?.url}
                // alt={`${user?.firstName!} ${user?.lastName!}`}
                alt={`${user?.name}`}
              />
              <AvatarFallback className="scale-150 ">
                {/* {user?.firstName} {user?.lastName} */}
                {/* {user?.name} */}
                <UserIcon />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-y-1">
              {/* {user?.firstName} {user?.lastName} */}
              {user?.name}
              <span className="text-muted-foreground">
                {/* {user?.emailAddresses[0].emailAddress} */}
                {user?.phone}
              </span>
              <span className="w-fit">
                <Badge
                  variant="secondary"
                  className="capitalize dark:bg-pink-700/30 dark:text-pink-700  bg-indigo-700/30 text-indigo-700 "
                >
                  {role?.toLocaleLowerCase()} Dashboard
                </Badge>
              </span>
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit">
        <LogoutButton className="flex items-center justify-center gap-4">
          <ExitIcon className="h-4 w-4" />
          خروج
        </LogoutButton>
      </PopoverContent>
    </Popover>
  )
}
