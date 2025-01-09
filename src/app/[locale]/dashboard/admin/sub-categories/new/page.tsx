import SubCategoryDetails from '@/components/dashboard/forms/sub-category-details copy'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function AdminNewSubCategoryPage() {
  const categories = await prisma.category.findMany({
    where: {},
    select: {
      name: true,
      id: true,
    },
  })
  if (!categories) return notFound()
  return (
    <div className="w-full">
      <SubCategoryDetails categories={categories} />
    </div>
  )
}
