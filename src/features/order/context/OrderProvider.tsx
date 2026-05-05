import React, { createContext, PropsWithChildren, useState } from 'react'
import { ProductDetailType } from '../types/product-type'
import { BatchType } from '../types/batch-type'

type OrderProviderProps = {
      currentStep: number
      handleNextStep: () => void
      handlePreviousStep: () => void
      listProductChose: ProductDetailType[]
      handleSelectProduct: (product: ProductDetailType) => void
      handleRemoveProduct: (productId: string) => void
      listBatchChosen: Map<string, BatchType[]>
      handleAddBatch: (productId: string, batch: BatchType) => void
      handleRemoveBatch: (productId: string, batchId: string) => void
}

const OrderContext = createContext<OrderProviderProps | undefined>(undefined)

export function OrderProvider({ children }: PropsWithChildren) {
  const [currentStep, setCurrentStep] = useState(1)
  const [listProductChose, setListProductChose] = useState<ProductDetailType[]>([])
  const [listBatchChosen, setListBatchChosen] = useState<Map<string, BatchType[]>>(new Map())
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
      newListProduct.push(product)
      setListProductChose(newListProduct)
  }
  const handleRemoveProduct = (productId: string) => {
      const updateNewProductList = listProductChose.filter((product) => product.id !== productId)
      setListProductChose(updateNewProductList)
      // Remove out of the map if we had push it in during the chose batch step
      const newMapList = new Map(listBatchChosen)
      newMapList.delete(productId)
      setListBatchChosen(newMapList)
  }

  const handleAddBatch = (productId: string, batch: BatchType) => {
    const newMapList = new Map(listBatchChosen)
    const currentListOrderItem = newMapList.get(productId)
    // Check order items of this productId exist or not
    if (currentListOrderItem) {
      // Check the current batch is existed in order items list or not
      const isOrderItemExisted = currentListOrderItem?.find(currentBatch => currentBatch.id == batch.id)
      // Update previous amount to current amount
      if (isOrderItemExisted) {
        const newBatchAmount = batch.quantity
        const newUpdateOrderItem: BatchType = {...isOrderItemExisted, quantity: newBatchAmount }
        const newListOrderItem = currentListOrderItem.filter((currentBatch) => currentBatch.id !== batch.id)
        newListOrderItem.push(newUpdateOrderItem)
        newMapList.set(productId, newListOrderItem)
        setListBatchChosen(newMapList)
      }
      // Update new batch if it not available in order items yet 
      else {
        newMapList.set(productId, [...currentListOrderItem, batch])
        setListBatchChosen(newMapList)
      }
    } else {
      newMapList.set(productId, [batch])
      setListBatchChosen(newMapList)
    }
  }

  const handleRemoveBatch = (productId: string, batchId: string) => {
    const newMapList = new Map(listBatchChosen)
    const currentListOrderItem = newMapList.get(productId)
    if (currentListOrderItem) {
      const isRemovingBatchExisted = currentListOrderItem.find((currentBatch) => currentBatch.id === batchId)
      if (isRemovingBatchExisted) {
        const newListOrderItemProduct = currentListOrderItem.filter((currentBatch) => currentBatch.id !== batchId)
        // check if we filter to delete the target batch and the list batch is empty => remove product out of the map
        if (newListOrderItemProduct.length === 0) newMapList.delete(productId)
        // if list batch of this productId is still has members => update new list batch without out the batch removing target
        else newMapList.set(productId, newListOrderItemProduct)
        setListBatchChosen(newMapList)
      }
    }
  }


  return (
    <OrderContext.Provider value={{ currentStep, handleNextStep, handlePreviousStep, handleRemoveProduct, handleSelectProduct, handleAddBatch, handleRemoveBatch, listProductChose, listBatchChosen }}>
      {children}
    </OrderContext.Provider>
  )
}

export default OrderContext