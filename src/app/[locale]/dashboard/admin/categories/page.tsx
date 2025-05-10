// Queries

// Data table

import { Plus } from 'lucide-react'

import { columns } from './columns'
import CategoryDetails from '@/components/dashboard/forms/category-details'
import DataTable from '@/components/ui/data-table'
import { getAllCategories } from '@/lib/queries/dashboard'

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const asyncPage = (await searchParams).page
  const page = asyncPage ? +asyncPage : 1

  // Fetching stores data from the database
  const categoriesResponse = await getAllCategories({ page })
  // console.log(categoriesResponse.categories)

  // Checking if no categories are found
  if (!categoriesResponse.categories) return null // If no categories found, return null

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create category
        </>
      }
      modalChildren={<CategoryDetails />}
      newTabLink="/dashboard/admin/categories/new"
      filterValue="name"
      data={categoriesResponse.categories}
      searchPlaceholder="Search category name..."
      columns={columns}
    />
  )
}
