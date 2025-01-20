import { createSharedPathnamesNavigation } from 'next-intl/navigation'

export const locales = ['en', 'fa'] as const
export const localePrefix = 'always'

export const { Link, redirect, usePathname, useRouter, permanentRedirect } =
  createSharedPathnamesNavigation({ locales, localePrefix })

export const i18n = {
  locales: [
    { code: 'en', name: 'English', icon: '🇺🇸' },
    { code: 'fa', name: 'فارسی', icon: '🇮🇷' },
  ],
  defaultLocale: 'fa',
}
