import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native'
import { ProductDetailType } from '../types/product-type'
import Card from '@/components/ui/cards/Card'
import Tag from '@/components/ui/tags/Tag'
import { PRODUCT_PACKAGE_TYPE, PRODUCT_TYPE } from '../const/product-type'
import useContextValid from '@/hooks/useContextValid'
import OrderContext from '../context/OrderProvider'
import { useMemo, useState } from 'react'
import { formatDate } from '@/utils/format'
import { BatchType } from '../types/batch-type'
import { ChevronDown, ChevronUp } from 'lucide-react-native'



export default function ProductItemV3({ item }: { item: ProductDetailType }) {
  const { listBatchChosen } = useContextValid(OrderContext)
  const [isOpenDetail, setIsOpenDetail] = useState(false)
  const listBatchRelatedToProduct = useMemo(() => {
      return listBatchChosen.get(item.id)
  }, [listBatchChosen])
  const handleOpenDetail = () => {
      setIsOpenDetail(prevState => !prevState)
  }
  return (
      <Card style={styles.outerCardContainer}>
         <View style={styles.cardContainer}>
            <Image 
                  source={item.imageUrl? { uri: item.imageUrl } : require('@assets/product-unavailable.png')} 
                  style={styles.image} 
            />
            <View style={styles.informationContainer}>
                  <Text style={styles.productName}>{item.name} - {item.brand}</Text>
                  <View style={styles.tagContainer}>
                        <Tag variant='gray' style={styles.tag}>
                              <Text style={styles.textTag}>{item.productPackagingType}</Text>
                        </Tag>
                        <Tag variant='gray' style={styles.tag}>
                              <Text style={styles.textTag}>{item.volumeMl}ml</Text>
                        </Tag>
                        <Tag variant='gray' style={styles.tag}>
                              <Text style={styles.textTag}>{item.productKind}</Text>
                        </Tag>
                  </View>
                  <Text style={styles.price}>{item.price.toLocaleString()}đ</Text>
            </View>
         </View>
         <TouchableOpacity onPress={handleOpenDetail} style={styles.detailBtn}>
            <Text>Xem chi tiết lô</Text>
            {isOpenDetail ? <ChevronUp />:<ChevronDown />}
         </TouchableOpacity>
         { isOpenDetail &&
            <View style={styles.listBatchContainer}>
                  <ScrollView> 
                       {listBatchRelatedToProduct?.map((batch) => (
                        <View key={batch.id} style={styles.batchContentContainer}>
                              <View>
                                    <Text style={styles.codeText}>{batch.code}</Text>
                                    <Text style={styles.normalText}>{formatDate(batch.expiryDate)}</Text>
                              </View>
                              <Text style={styles.normalText}>x{batch.quantity}</Text>
                        </View>
                       ))}
                  </ScrollView>
            </View>
         }
      </Card>
  )
}

const styles = StyleSheet.create({
   outerCardContainer: {
      flexDirection: 'column',
      gap: 5,
      marginVertical: 10
   },
   cardContainer: {
      flexDirection: 'row',
      gap: 10,
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
      gap: 5,
      alignItems: 'center' 
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
   },
   detailBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end'
   },
   listBatchContainer: {
      backgroundColor: '#003366',
      paddingVertical: 10,
      paddingHorizontal: 15,
      flexDirection: 'row',
      maxHeight: 150,
      minHeight: 70,
      borderRadius: 10,
   },
   batchContentContainer: {
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      marginVertical: 5
   },
   codeText: {
      fontWeight: 600,
      fontSize: 16,
      color: '#ffffff'
   },
   normalText: {
      fontSize: 12,
      color: '#ffffff'
   }
})    