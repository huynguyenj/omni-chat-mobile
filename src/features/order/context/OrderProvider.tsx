import React, { createContext, PropsWithChildren, useState } from 'react'
import { ProductDetailType } from '../types/product-type'

type OrderProviderProps = {
      currentStep: number
      handleNextStep: () => void
      handlePreviousStep: () => void
      listProductChose: Pick<ProductDetailType, 'id' | 'name' | 'volumeMl' | 'productPackagingType' | 'brand' | 'imageUrl'>[]
      handleSelectProduct: (product: ProductDetailType) => void
      handleRemoveProduct: (productId: string) => void
}

const OrderContext = createContext<OrderProviderProps | undefined>(undefined)

export function OrderProvider({ children }: PropsWithChildren) {
  const [currentStep, setCurrentStep] = useState(1)
  const [listProductChose, setListProductChose] = useState<Pick<ProductDetailType, 'id' | 'name' | 'volumeMl' | 'productPackagingType' | 'brand' | 'imageUrl'>[]>([])
  const handleNextStep = () => {
      if (currentStep === 3) return
      setCurrentStep(prevStep => prevStep + 1) 
  }

  const handlePreviousStep = () => {
      if (currentStep === 1) return
      setCurrentStep(prevStep => prevStep - 1) 
  }

  const handleSelectProduct = (product: ProductDetailType) => {
      const newListProduct = listProductChose.filter((prevProduct) => prevProduct.id !== product.id)
      newListProduct.push({
            id: product.id,
            brand: product.brand,
            imageUrl: product.imageUrl,
            name: product.name,
            productPackagingType: product.productPackagingType,
            volumeMl: product.volumeMl
      })
      setListProductChose(newListProduct)
  }
  const handleRemoveProduct = (productId: string) => {
      const updateNewProductList = listProductChose.filter((product) => product.id !== productId)
      setListProductChose(updateNewProductList)
  }
  return (
    <OrderContext.Provider value={{ currentStep, handleNextStep, handlePreviousStep, handleRemoveProduct, handleSelectProduct, listProductChose }}>
      {children}
    </OrderContext.Provider>
  )
}

export default OrderContext