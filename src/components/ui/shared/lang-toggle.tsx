'use client'
import * as React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export default function LangToggle() {
  const router = useRouter()

  //   const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //     const newLocale = e.target.value as string
  //     const path = pathname.split('/').slice(2).join('/')

  //     router.push(`/${newLocale}/${path}`)
  //   }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Languages />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/fa`)}>
          فارسی
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/en`)}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
