import Footer from '@/components/amazon/footer'
import Header from '@/components/amazon/header'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'

// export async function generateMetadata() {
//   const {
//     site: { slogan, name, description, url },
//   } = await getSetting()
//   return {
//     title: {
//       template: `%s | ${name}`,
//       default: `${name}. ${slogan}`,
//     },
//     description: description,
//     metadataBase: new URL(url),
//   }
// }
export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="flex flex-col min-h-screen">
        {/* <Header /> */}
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </div>
      <Toaster position="top-center" richColors />
    </div>
  )
}
