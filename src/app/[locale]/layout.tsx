import type { Metadata } from 'next'
// import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import { routing } from '@/i18n/routing'
import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from '@/providers/theme-providers'
import { notFound } from 'next/navigation'
import AuthProvider from '@/providers/AuthProvider'
import { Toaster } from 'sonner'
import QueryProviders from '@/providers/query-provider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// })

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// })

export const metadata: Metadata = {
  title: 'GoShop',
  description: 'Welcome to GoShop',
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const locale = (await params).locale
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <AuthProvider>
        <body className={`  antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProviders>
              <NextIntlClientProvider messages={messages}>
                <NuqsAdapter>{children}</NuqsAdapter>
                <Toaster />
              </NextIntlClientProvider>
            </QueryProviders>
          </ThemeProvider>
        </body>
      </AuthProvider>
    </html>
  )
}
