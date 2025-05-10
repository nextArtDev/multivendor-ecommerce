// Queries

// Data table

import { Plus } from 'lucide-react'

import { columns } from './columns'

import DataTable from '@/components/ui/data-table'
import { getAllSubCategories } from '@/lib/queries/dashboard'
import SubCategoryDetails from '@/components/dashboard/forms/sub-category-details'
import { prisma } from '@/lib/prisma'

export default async function AdminSubCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const asyncPage = (await searchParams).page
  const page = asyncPage ? +asyncPage : 1

  // Fetching stores data from the database
  const subCategoriesResponse = await getAllSubCategories({ page })
  const categories = await prisma.category.findMany({})
  // console.log(subCategoriesResponse.subCategories)

  // Checking if no categories are found
  if (!subCategoriesResponse.subCategories || !categories) return null // If no categories found, return null

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create category
        </>
      }
      modalChildren={<SubCategoryDetails categories={categories} />}
      newTabLink="/dashboard/admin/sub-categories/new"
      filterValue="name"
      data={subCategoriesResponse.subCategories}
      searchPlaceholder="Search sub category name..."
      columns={columns}
    />
  )
}
