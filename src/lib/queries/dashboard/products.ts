import { prisma } from '@/lib/prisma'
// Function: getAllStoreProducts
// Description: Retrieves all products from a specific store based on the store URL.
// Access Level: Public
// Parameters:
//   - storeUrl: The URL of the store whose products are to be retrieved.

// Returns: Array of products from the specified store, including category, subcategory, and variant details.
export const getAllStoreProducts = async (storeUrl: string) => {
  // Retrieve store details from the database using the store URL
  try {
    const store = await prisma.store.findUnique({ where: { url: storeUrl } })
    if (!store) throw new Error('Please provide a valid store URL.')

    // Retrieve all products associated with the store
    const products = await prisma.product.findMany({
      where: {
        storeId: store.id,
      },
      include: {
        category: true,
        subCategory: true,
        offerTag: true,
        variants: {
          include: {
            images: { orderBy: { created_at: 'asc' } },
            colors: true,
            sizes: true,
          },
        },
        store: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    })
    // console.log({ products })
    return products
  } catch (error) {
    console.log(error)
  }
}

export const getProductMainInfo = async (productId: string) => {
  // Retrieve the product from the database
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      questions: true,
      specs: true,
    },
  })
  if (!product) return null

  // Return the main information of the product
  return {
    productId: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,
    offerTagId: product.offerTagId || undefined,
    storeId: product.storeId,
    shippingFeeMethod: product.shippingFeeMethod,
    questions: product.questions.map((q) => ({
      question: q.question,
      answer: q.answer,
    })),
    product_specs: product.specs.map((spec) => ({
      name: spec.name,
      value: spec.value,
    })),
  }
}
