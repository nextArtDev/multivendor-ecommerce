import CategoryDetails from '@/components/dashboard/forms/category-details'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const categoryId = (await params).categoryId

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
    },
    include: {
      images: true,
    },
  })
  if (!category) return notFound()
  return (
    <div>
      <CategoryDetails initialData={category} />
    </div>
  )
}
