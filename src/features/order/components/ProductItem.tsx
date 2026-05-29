import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { ProductDetailType } from '../types/product-type'
import Card from '@/components/ui/cards/Card'
import Tag from '@/components/ui/tags/Tag'
import { PRODUCT_PACKAGE_TYPE, PRODUCT_TYPE } from '../const/product-type'
import useContextValid from '@/hooks/useContextValid'
import OrderContext from '../context/OrderProvider'

export default function ProductItem({ item }: { item: ProductDetailType }) {
  const { listProductChose, handleSelectProduct, handleRemoveProduct } = useContextValid(OrderContext)
  return (
   <TouchableOpacity delayLongPress={300} onPress={() => handleSelectProduct(item)} onLongPress={() => handleRemoveProduct(item.id)}>
      <Card style={[ styles.cardContainer, listProductChose.find((product) => product.id === item.id) && styles.cardActive ]}>
            <Image 
                  source={item.imageUrl? { uri: item.imageUrl } : require('@assets/product-unavailable.png')} 
                  style={styles.image} 
                  />
            <View style={styles.informationContainer}>
                  <Text style={styles.productName}>{item.name} - {item.brand}</Text>
                  <View style={styles.tagContainer}>
                        <Tag variant='gray' style={styles.tag}>
                              <Text style={styles.textTag}>{PRODUCT_PACKAGE_TYPE[item.productPackagingType].name}</Text>
                        </Tag>
                        <Tag variant='gray' style={styles.tag}>
                              <Text style={styles.textTag}>{item.volumeMl}ml</Text>
                        </Tag>
                        <Tag variant='gray' style={styles.tag}>
                              <Text style={styles.textTag}>{PRODUCT_TYPE[item.productKind].name}</Text>
                        </Tag>
                  </View>
                  <Text style={styles.price}>{item.price.toLocaleString()}đ</Text>
            </View>
      </Card>
   </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
   cardContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginVertical: 5
   },
   cardActive: {
      borderLeftWidth: 5,
      borderLeftColor: '#003366'
   },
   image: {
      width: 90,
      height: 90,
      borderRadius: 10,
      objectFit: 'cover',
      backgroundColor: '#E6E8EB'
   },
   informationContainer: {
      flexDirection: 'column',
      gap: 5
   },
   productName: {
      fontSize: 15,
      color: '#003366',
      fontWeight: 600,
      width: 240
   },
   tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
      alignItems: 'center', 
      width: '90%',
   },
   price: {
      color: '#2ECC71',
      fontSize: 17,
      fontWeight: 700,
   },
   tag: {
      borderRadius: 5
   },
   textTag: {
      fontWeight: 600,
      fontSize: 13,
   }
})