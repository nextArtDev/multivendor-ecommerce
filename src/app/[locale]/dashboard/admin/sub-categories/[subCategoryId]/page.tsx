import SubCategoryDetails from '@/components/dashboard/forms/sub-category-details'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function EditsubCategoryPage({
  params,
}: {
  params: Promise<{ subcategoryId: string }>
}) {
  const subcategoryId = (await params).subcategoryId

  const subcategory = await prisma.subCategory.findFirst({
    where: {
      id: subcategoryId,
    },
    include: {
      images: true,
      category: true,
    },
  })
  const categories = await prisma.category.findMany({})
  console.log({ subcategory })
  if (!subcategory) return notFound()
  return (
    <div>
      <SubCategoryDetails categories={categories} initialData={subcategory} />
    </div>
  )
}
