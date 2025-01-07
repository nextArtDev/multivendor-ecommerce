import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Image, User } from '@prisma/client'
import { UserIcon } from 'lucide-react'

import React from 'react'

export default function UserInfo({
  user,
}: {
  user: (User & { image: Image | null }) | null
}) {
  const role = user?.role?.toString()
  return (
    <div>
      <div>
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
      </div>
    </div>
  )
}
