'use client'

// React, Next.js

import { usePathname } from 'next/navigation'

// UI Components
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

// Icons
import { icons } from '@/constants/icons'

// types
// import { DashboardSidebarMenuInterface } from "@/lib/types";

// Utils
import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/navigation'

export default function SidebarNavSeller({
  menuLinks,
}: {
  // menuLinks: DashboardSidebarMenuInterface[];
  menuLinks: any[]
}) {
  const pathname = usePathname()
  const locale = useLocale()
  const storeUrlStart = pathname.split('/stores/')[1]
  const activeStore = storeUrlStart ? storeUrlStart.split('/')[0] : ''
  const t = useTranslations('SellerDashboardSidebarOptions')
  return (
    <nav className="relative grow">
      <Command className="rounded-lg overflow-visible bg-transparent">
        <CommandInput placeholder="Search..." />
        <CommandList className="py-2 overflow-visible">
          <CommandEmpty>No Links Found.</CommandEmpty>
          <CommandGroup className="overflow-visible pt-0 relative">
            {menuLinks.map((link, index) => {
              let icon
              const iconSearch = icons.find((icon) => icon.value === link.icon)
              if (iconSearch) icon = <iconSearch.path />
              // console.log({ pathname })
              // console.log(`/${locale}/${link.link}`)
              // console.log(`/seller/stores/${activeStore}/${link.link}`)
              return (
                <CommandItem
                  key={index}
                  className={cn('w-full h-12 cursor-pointer mt-1', {
                    'bg-accent text-accent-foreground':
                      `${locale}/${link.link}` === ''
                        ? pathname === `/dashboard/seller/stores/${activeStore}`
                        : `/seller/stores/${activeStore}/${link.link}` ===
                          pathname,
                  })}
                >
                  <Link
                    href={`/dashboard/seller/stores/${activeStore}/${link.link}`}
                    className="flex items-center gap-2 hover:bg-transparent rounded-md transition-all w-full"
                  >
                    {icon}
                    <span>{t(link.label)}</span>
                  </Link>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </nav>
  )
}
