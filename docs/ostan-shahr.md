# How to get Ostan Based on City

```ts
  useEffect(() => {
    const getSubCategories = async () => {
      const res = await getAllCategoriesForCategory(form.watch().categoryId)
      setSubCategories(res)
    }
    getSubCategories()
  }, [form.watch().categoryId])

 
<InputFieldset label="Category">
    <div className="flex gap-4">
      <FormField
        disabled={isLoading}
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem className="flex-1">
            <Select
              disabled={isLoading || categories.length == 0}
              onValueChange={field.onChange}
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    defaultValue={field.value}
                    placeholder="Select a category"
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        disabled={isLoading}
        control={form.control}
        name="subCategoryId"
        render={({ field }) => (
          <FormItem className="flex-1">
            <Select
              disabled={
                isLoading ||
                categories.length == 0 ||
                !form.getValues().categoryId
              }
              onValueChange={field.onChange}
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    defaultValue={field.value}
                    placeholder="Select a sub-category"
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {subCategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

// Server:
export const getAllCategoriesForCategory = async (
  categoryId: string
): Promise<SubCategory[] |null> => {
  // Retrieve all subcategories of category from the database
  const subCategories = await prisma.subCategory.findMany({
    where: {
      categoryId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
  return subCategories
}
```