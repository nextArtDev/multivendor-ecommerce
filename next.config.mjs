import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  // i18n: {
  //   locales: ['en', 'fa'],
  //   defaultLocale: 'fa',
  //   localeDetection: false,
  // },
  // trailingSlash: true,
}

export default withNextIntl(nextConfig)
