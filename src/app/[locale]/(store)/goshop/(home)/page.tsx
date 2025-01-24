import React from 'react'
import Header from '../components/header/header'
import CategoriesHeader from '../components/categories-header'
import Footer from '../components/footer'
import { getProducts } from '../lib/queries/product'

const GoshopHomePage = async () => {
  const products = await getProducts({}, '')
  // console.log(
  //   products.products.flatMap((p) => p.variantImages.flatMap((i) => i.image))
  // )
  // console.log(products.products.flatMap((p) => p.images.map((i) => i.url)))
  return (
    <div>
      <Header />
      <CategoriesHeader />
      <div className="min-h-screen w-full"></div>
      <Footer />
    </div>
  )
}

export default GoshopHomePage
