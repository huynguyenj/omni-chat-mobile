import { View, Text } from 'react-native'
import React from 'react'
import ProductManagementContent from '@/features/product-manager/components/ProductManagementContent'

export default function ProductManagement() {
  return (
    <View style={{ flex: 1 }}>
      <ProductManagementContent/>
    </View>
  )
}