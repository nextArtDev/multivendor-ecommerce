'use client'
import * as React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LangToggle() {
  const router = useRouter()

  //   const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //     const newLocale = e.target.value as string
  //     const path = pathname.split('/').slice(2).join('/')

  //     router.push(`/${newLocale}/${path}`)
  //   }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="shadow-2xl border size-8  rounded-md"
      >
        <Languages className="p-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="!min-w-[4rem]" align="end">
        <DropdownMenuItem className="!w-fit" onClick={() => router.push(`/fa`)}>
          فارسی
        </DropdownMenuItem>
        <DropdownMenuItem className="w-fit" onClick={() => router.push(`/en`)}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
