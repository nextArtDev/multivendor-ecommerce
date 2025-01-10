'use client'

// React, Next.js
import { Link } from '@/navigation'
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

export default function SidebarNavAdmin({
  menuLinks,
}: {
  // menuLinks: DashboardSidebarMenuInterface[]
  menuLinks: any[]
}) {
  const pathname = usePathname()
  const locale = useLocale()

  const t = useTranslations('adminDashboardSidebarOptions')
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

              return (
                <CommandItem
                  key={index}
                  className={cn('w-full h-12 cursor-pointer mt-1', {
                    'bg-primary text-secondary  ':
                      `/${locale}${link.link}` == pathname,
                  })}
                >
                  <Link
                    href={link.link}
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
