import { getSubcategories } from '../../lib/queries/subCategories'
import Contact from './contact'
import Links from './links'
import Newsletter from './newsletter'

export default async function Footer() {
  const subs = await getSubcategories(7, true)
  return (
    <div className="w-full  bg-gradient-to-r dark:from-slate-500 dark:to-slate-800  from-slate-600  to-slate-200">
      <Newsletter />
      <div className="max-w-[1430px] mx-auto bg-background">
        <div className="p-5">
          <div className="grid md:grid-cols-2 md:gap-x-5">
            <Contact />
            <Links subs={subs} />
          </div>
        </div>
      </div>
      <div className="  px-2  ">
        <div className="max-w-[1430px] mx-auto flex items-center h-7">
          <span className="text-sm">
            <b>© GoShop</b> - All Rights Reserved
          </span>
        </div>
      </div>
    </div>
  )
}
