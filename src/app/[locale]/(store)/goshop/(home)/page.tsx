import React from 'react'
import Header from '../components/header/header'
import CategoriesHeader from '../components/categories-header'
import Footer from '../components/footer'

const GoshopHomePage = () => {
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
