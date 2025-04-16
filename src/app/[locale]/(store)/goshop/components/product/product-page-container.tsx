'use client'
// import {
//   CartProductType,
//   Country,
//   ProductDataType,
//   ProductVariantDataType,
//   ShippingDetailsType,
// } from '@/lib/types'
import { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import {
  CartProductType,
  ProductDataType,
  ProductVariantDataType,
} from '../../types'
import { Country } from '../country-lang-curr-selector'
import ProductSwiper from './product-swiper'
import ProductInfo from './product-info'
import ProductPageActions from './product-actions'
import { isProductValidToAdd } from '../../lib/utils'
import { useSearchParams } from 'next/navigation'
import { Rating } from '@/components/shared/rating'
import { useCartStore } from '@/cart-store/useCartStore'
import useFromStore from '@/hooks/useFromStore'

// import { useCartStore } from '@/cart-store/useCartStore'
// import useFromStore from '@/hooks/useFromStore'
// import { setCookie } from 'cookies-next'
// import ProductPageActions from './actions'

interface Props {
  productData: ProductDataType
  children: ReactNode
  variantSlug: string
  userCountry: Country
}

const ProductPageContainer: FC<Props> = ({
  productData,
  variantSlug,
  children,
  userCountry,
}) => {
  const searchParams = useSearchParams()
  const variantSlugParam = searchParams.get('variant')

  const { id, slug, variants, images } = productData

  const [variant, setVariant] = useState<ProductVariantDataType>(
    variants.find((v) => v.slug === variantSlug) || variants[0]
  )

  useEffect(() => {
    const variant = variants.find((v) => v.slug === variantSlug)
    if (variant) {
      setVariant(variant)
    }
  }, [variantSlug])

  const [sizeId, setSizeId] = useState(
    variant.sizes.length === 1 ? variant.sizes[0].id : ''
  )

  const { id: variantId, variantName, variantImage, weight, sizes } = variant

  // useState hook to manage the active image being displayed, initialized to the first image in the array
  const [activeImage, setActiveImage] = useState<{ url: string } | null>(
    variantImage[0]
  )

  // Initialize the default product data for the cart item
  const data: CartProductType = {
    productId: id,
    variantId,
    productSlug: slug,
    variantSlug: variant.slug,
    name: productData.name,
    variantName: variantName,
    images: images,
    variantImage: variantImage[0].url,
    quantity: 1,
    price: 0,
    sizeId: sizeId || '',
    size: '',
    stock: 1,
    weight: weight,
    shippingMethod: '',
    shippingService: '',
    shippingFee: 0,
    extraShippingFee: 0,
    deliveryTimeMin: 0,
    deliveryTimeMax: 0,
    isFreeShipping: false,
  }

  // useState hook to manage the product's state in the cart
  const [productToBeAddedToCart, setProductToBeAddedToCart] =
    useState<CartProductType>(data)

  const { stock } = productToBeAddedToCart

  // Usestate hook to manage product validity to be added to cart
  const [isProductValid, setIsProductValid] = useState<boolean>(false)

  // Function to handle state changes for the product properties
  const handleChange = (property: keyof CartProductType, value: unknown) => {
    setProductToBeAddedToCart((prevProduct) => ({
      ...prevProduct,
      [property]: value,
    }))
  }

  // Automatically update the product data in cart whenever `productData` or `variant` changes
  useEffect(() => {
    setProductToBeAddedToCart((prevProduct) => ({
      ...prevProduct,
      productId: id,
      variantId,
      productSlug: slug,
      variantSlug: variant.slug,
      name: productData.name,
      variantName: variantName,
      images: images,
      variantImage: variantImage[0].url,
      stock: variant.sizes.find((s) => s.id === sizeId)?.quantity || 1,
      weight: weight,
    }))
  }, [
    id,
    slug,
    variantSlug,
    variant,
    productData,
    variantName,
    variantImage,
    weight,
    images,
    sizeId,
    variantId,
  ])

  useEffect(() => {
    const check = isProductValidToAdd(productToBeAddedToCart)
    if (check !== isProductValid) {
      setIsProductValid(check)
    }
  }, [productToBeAddedToCart])

  // Get the set Cart action to update items in cart
  const setCart = useCartStore((state) => state.setCart)

  const cartItems = useFromStore(useCartStore, (state) => state.cart)

  // Keeping cart state updated
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Check if the "cart" key was changed in localStorage
      if (event.key === 'cart') {
        try {
          const parsedValue = event.newValue ? JSON.parse(event.newValue) : null

          // Check if parsedValue and state are valid and then update the cart
          if (
            parsedValue &&
            parsedValue.state &&
            Array.isArray(parsedValue.state.cart)
          ) {
            setCart(parsedValue.state.cart)
          }
        } catch (error) {
          console.log({ error })
        }
      }
    }

    // Attach the event listener
    window.addEventListener('storage', handleStorageChange)

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [setCart])

  // Add product to history
  // updateProductHistory(variantId)

  const maxQty = useMemo(() => {
    const search_product = cartItems?.find(
      (p) =>
        p.productId === id && p.variantId === variantId && p.sizeId === sizeId
    )
    return search_product
      ? search_product.stock - search_product.quantity
      : stock
  }, [cartItems, id, variantId, sizeId, stock])

  // // Set view cookie
  // setCookie(`viewedProduct_${id}`, 'true', {
  //   maxAge: 3600,
  //   path: '/',
  // })

  const [isFixed, setIsFixed] = useState(false)
  const [offsetLeft, setOffsetLeft] = useState(0) // Holds the calculated left offset

  const handleScroll = () => {
    const childrenElement = document.getElementById('children-container')
    if (childrenElement) {
      const rect = childrenElement.getBoundingClientRect()
      // Adjust the offset when the scroll position changes
      if (window.scrollY > 600) {
        setIsFixed(true)
        setOffsetLeft(rect.right) // Set the offset based on the children container's position
      } else {
        setIsFixed(false)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    // Recalculate the position when the window is resized (including zooming)
    window.addEventListener('resize', handleScroll)

    // Initial calculation
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // console.log('stock', productToBeAddedToCart.stock)

  return (
    <div className="relative">
      <div className="w-full xl:flex xl:gap-4">
        <div className="w-full flex-1 max-w-md mx-auto">
          <ProductSwiper
            // images={variant.variantImage}
            images={productData.images}
            // images={
            //   variant.variantImage.length > 0
            //     ? variant.variantImage
            //     : productData.images
            // }
            activeImage={activeImage || variant.variantImage[0]}
            setActiveImage={setActiveImage}
          />
        </div>
        <div className="w-full mt-4 md:mt-0 flex flex-col gap-4 lg:flex-row ">
          {/* Product main info */}
          <ProductInfo
            productData={productData}
            variant={variant}
            variantSlug={variantSlug}
            sizeId={sizeId}
            setSizeId={setSizeId}
            handleChange={handleChange}
            setActiveImage={setActiveImage}
            setVariant={setVariant}
            quantity={productToBeAddedToCart.quantity}
          />
          {/* Shipping details - buy actions buttons */}
          <div
            className={`w-full lg:w-[390px] ${
              isFixed
                ? `lg:fixed lg:top-2 transition-all duration-300 transform` // Removed hardcoded `left` value
                : 'relative'
            } z-20`}
            style={{
              left: isFixed ? `${offsetLeft + 20}px` : 'auto', // Dynamically adjust position
              transform: isFixed ? 'translateY(0)' : 'translateY(-10px)', // Example of a slight vertical translation when it becomes sticky
            }}
          >
            <ProductPageActions
              freeShipping={productData.freeShipping}
              shippingFeeMethod={productData.shippingFeeMethod}
              store={productData.store}
              userCountry={userCountry}
              weight={variant.weight}
              freeShippingForAllCountries={
                productData.freeShippingForAllCountries
              }
              productToBeAddedToCart={productToBeAddedToCart}
              isProductValid={isProductValid}
              handleChange={handleChange}
              maxQty={maxQty}
              // maxQty={10}
              sizeId={sizeId}
              sizes={sizes}
            />
          </div>
        </div>
      </div>
      <div
        id="children-container"
        className="lg:w-[calc(100%-410px)] mt-6 pb-16"
      >
        {children}
      </div>
    </div>
  )
}

export default ProductPageContainer
