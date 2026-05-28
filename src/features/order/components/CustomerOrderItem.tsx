import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React, { useMemo, useState } from 'react'
import { OrderItemType, OrderType } from '../types/order-type'
import Card from '@/components/ui/cards/Card'
import { Eye, Minus, Package, Plus, RotateCcw } from 'lucide-react-native'
import { formatDate, formatTime } from '@/utils/format'
import Tag from '@/components/ui/tags/Tag'
import { getOrderStatusDisplay } from '../const/order-status'
import Button from '@/components/ui/buttons/Button'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import Checkbox from '@/components/ui/inputs/Checkbox'
import usePostRequestSale from '../hooks/usePostRequestSale'
import Input from '@/components/ui/inputs/Input'
import Select from '@/components/ui/select/Select'
import { LIST_POST_REQUEST_TYPE, POST_REQUEST_TYPE } from '../const/post-request-type'
import { Controller } from 'react-hook-form'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

export default function CustomerOrderItem({ item }: { item: OrderType }) {
  const [isDetailOrderOpen, setIsDetailOrderOpen] = useState(false)
  const [isRefundOpen, setIsRefundOpen] = useState(false)
  const [listRefund, setListRefund] = useState<Map<string, { number: number, price: number, name: string }>>(new Map())
  const { handleRefundOrder, loading, control, errors, handleSubmit, reset } = usePostRequestSale({ orderId: item.id, customerId: item.customerId })
  const handleOpenDetailOrder = () => {   
      setIsDetailOrderOpen(prevState => !prevState)
  }
  const handleOpenRefund = () => {
      setIsRefundOpen(prevState => !prevState)
  }
  const handleSelectOrderItems = (orderItem: OrderItemType) => {
      const isItemExisted = listRefund.get(orderItem.id)
      const updateNewItems = new Map(listRefund)
      if (isItemExisted) {
        updateNewItems.delete(orderItem.id)
        setListRefund(updateNewItems)
        return
      }
      updateNewItems.set(orderItem.id, { name: orderItem.productName, number: 1, price: orderItem.itemsPrice })
      setListRefund(updateNewItems)
  }
  const handleAddQuantity = (orderItemId: string, maxQuantity: number) => {
      let targetOrderItemQuantity = listRefund.get(orderItemId)
      if (!targetOrderItemQuantity) return
      targetOrderItemQuantity.number += 1
      if (targetOrderItemQuantity.number > maxQuantity) return
      const newOrderItemMap = new Map(listRefund)
      newOrderItemMap.set(orderItemId, targetOrderItemQuantity)
      setListRefund(newOrderItemMap)
  }
    const handleMinusQuantity = (orderItemId: string) => {
      let targetOrderItemQuantity = listRefund.get(orderItemId)
      if (!targetOrderItemQuantity) return
      targetOrderItemQuantity.number -= 1
      if (targetOrderItemQuantity.number < 1) return
      const newOrderItemMap = new Map(listRefund)
      newOrderItemMap.set(orderItemId, targetOrderItemQuantity)
      setListRefund(newOrderItemMap)
  }
  const totalRefundAmount = useMemo(() => {
    const listRefundOrderItems = Array.from(listRefund.values())
    return listRefundOrderItems.reduce((total, item) => {
      return total + (item.price * item.number)
    }, 0)
   }, [listRefund])
  const orderStatus = getOrderStatusDisplay(item.status)
  return (
    <Card style={styles.cardContainer}>
      <Card variant='primary' style={styles.illustrationContainer}>
            <Package color={'#ffffff'}/>
      </Card>
      <View>
            <View style={styles.textContainer}>
                  <Text style={styles.vitalText}>#{item.code}</Text>
                  <Text style={styles.vitalText}>{item.totalAmount.toLocaleString()}đ</Text>
            </View>
            <View style={styles.timeContentContainer}>
                  <Text style={styles.timeText}>{formatTime(item.orderDate)}</Text>
                  <Text style={styles.timeText}>•</Text>
                  <Text style={styles.timeText}>{formatDate(item.orderDate)}</Text>
            </View>
                  <Tag variant={orderStatus.tagVariant} style={styles.tagContainer}>
                        <Text style={[styles.tagText, orderStatus.tagVariant === 'gray' && { color: '#000000' } ]}>{orderStatus.name}</Text>
                  </Tag>
            <View style={styles.btnContainer}>
                  <Button variant='outline' content='Chi tiết' style={styles.detailBtn} icon={{ iconName: Eye, iconDirection: 'left' }} onPress={handleOpenDetailOrder}/>
                  { item.status === 'Completed' || item.status === 'Shipped' ?
                  <Button variant='danger' content='Hoàn trả' style={styles.detailBtn} icon={{ iconName: RotateCcw, iconDirection: 'left' }} onPress={handleOpenRefund}/>
                  :
                  <></>
                  }
            </View>
      </View>
      <ModalCustom isOpen={isDetailOrderOpen} onClose={handleOpenDetailOrder}>
        <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.listContainer}>
            <ScrollView>
                  { item.orderItems.map((item) => (
                        <Card key={item.id} variant='lightGrey'>
                          <Text style={styles.itemName}>Sản phẩm: {item.productName}</Text>
                          <View style={styles.itemPriceContentContainer}>
                              <Text style={styles.quantityText}>Số lượng:{item.quantity}</Text>
                              <Text style={styles.priceText}>{item.itemsPrice.toLocaleString()}đ</Text>
                          </View>
                        </Card>
                  )) }
            </ScrollView>
        </View>
      </ModalCustom>
      <ModalCustom isOpen={isRefundOpen} onClose={handleOpenRefund}>
       <ScrollView style={{ maxHeight: 630 }}>
            <Text style={styles.modalTitle}>Yêu cầu hoàn tiền</Text>
            <View style={styles.listRefundItemContainer}>
                  <ScrollView>
                        { item.orderItems.map((item) => (
                              <Card key={item.id} variant='lightGrey' style={styles.cardRefundItemContainer}>
                              <Checkbox checked={listRefund.has(item.id) ? true : false} onChange={()=> handleSelectOrderItems(item)}/>
                              <View>
                                    <Text style={styles.itemName}>Sản phẩm: {item.productName}</Text>
                                    <View style={styles.itemPriceContentContainer}>
                                          <Text style={styles.quantityText}>Số lượng:{item.quantity}</Text>
                                          <Text style={styles.priceText}>{item.itemsPrice.toLocaleString()}đ</Text>
                                    </View>
                                    { listRefund.has(item.id) && 
                                    <View style={styles.quantityContainer}>
                                          <Button style={styles.quantityBtn} icon={{ iconName: Minus, iconDirection: 'center' }} onPress={() => handleMinusQuantity(item.id)}/>
                                          <Text style={styles.quantityRefundText}>{listRefund.get(item.id)?.number}</Text>
                                          <Button style={styles.quantityBtn} icon={{ iconName: Plus, iconDirection: 'center' }} onPress={() => handleAddQuantity(item.id, item.quantity)}/>
                                    </View>
                                    }
                              </View>
                              </Card>
                        )) }
                  </ScrollView>
            </View>
            { listRefund.size > 0 &&
                  <Card style={styles.refundResultCardContainer}>
                              <Text style={styles.refundResultTitle}>Sản phẩm hoàn trả</Text>
                              <ScrollView>
                                    { Array.from(listRefund.values()).map((item, i) => (
                                          <View key={i}>
                                                <Text style={styles.refundItemText}>- {item.name} x{item.number}</Text>
                                                <Text style={styles.refundItemText}>{(item.number* item.price).toLocaleString()}đ</Text>
                                          </View>
                                    )) }
                              </ScrollView>
                              <View style={styles.refundTotalTitleContainer}>
                                    <Text style={styles.refundResultTitle}>Tổng tiền hoàn trả:</Text>
                                    <Text style={styles.refundResultTotalPrice}>{totalRefundAmount.toLocaleString()}đ</Text>
                              </View>
                  </Card>
            }
            <Controller
                  control={control}
                  name='reason'
                  render={({ field }) => (
                        <Input style={styles.inputContainer} 
                              label='Lí do' 
                              placeholder='Do hàng bị lỗi...' 
                              onChangeText={field.onChange}
                              error={errors.reason?.message}
                        />
                  )}
            />
            { item.status === 'Completed' && 
               <Controller
                     control={control}
                     name='type'
                     render={({ field }) => (
                     <Select
                           style={styles.inputContainer}
                           label='Loại hoàn trả'
                           value={field.value}
                           onChange={field.onChange}
                           options={[{ label: 'Hoàn hàng', value: 'Refund' }]}
                           error={errors.type?.message}
                           />
                     )}
                     />
               }
               { item.status === 'Shipped' && 
               <Controller
                     control={control}
                     name='type'
                     render={({ field }) => (
                     <Select
                           style={styles.inputContainer}
                           label='Loại hoàn trả'
                           value={field.value}
                           onChange={field.onChange}
                           options={[{ label: 'Trả hàng', value: 'Return' }]}
                           error={errors.type?.message}
                           />
                     )}
                     />
               }
                  <View style={styles.refundBtnContainer}>
                     {loading ?
                        <LoadingCircle/>
                        :
                        <>
                              <Button style={styles.refundBtn} variant='outline' content='Hủy' onPress={handleOpenRefund}/>
                              <Button style={styles.refundBtn} variant='danger' content='Hoàn trả' onPress={handleSubmit(data => handleRefundOrder(listRefund, data))}/>
                        </>
                     }
                  </View>
       </ScrollView>
      </ModalCustom>
    </Card>
  )
}

const styles = StyleSheet.create({
   cardContainer: {
      flexDirection: 'row',
      gap: 10,
      marginVertical: 5
   },
   illustrationContainer: {
      width: 40,
      height: 30,
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
   },
   textContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 290
   },
   vitalText:{ 
      fontSize: 15,
      fontWeight: 700
   },
   timeText: {
      color:'#888C94',
      fontSize: 12,
      fontWeight: 500
   },
   timeContentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2 
   },
   tagContainer: {
      alignSelf: 'flex-start',
      marginVertical: 10,
      paddingHorizontal: 15
   },
   tagText: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: 500,
   },
   btnContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 5,
   },
   detailBtn: {
      width: 115,
      paddingHorizontal: 5,
      paddingVertical: 5,
      borderRadius: 100
   },
   modalTitle: {
      fontSize: 16,
      color: '#003366',
      fontWeight: '600',
      textAlign: 'center',
   },
   listContainer: {
      maxHeight: 320,
      marginVertical: 10,
   },
   listRefundItemContainer: {
      maxHeight: 270,
      marginVertical: 10,
   },
   itemName: {
      fontSize: 15,
      fontWeight: 600,
      color: '#003366',
      maxWidth: 280
   },
   itemPriceContentContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: 265
   },
   quantityText: {
      color: '#888C94',
      fontSize: 12,
      fontWeight: 500,
   },
   priceText: {
      color: '#2ECC71',
      fontWeight: 700,
      fontSize: 16,
      maxWidth: 200,
      textAlign: 'right'
      
   },
   cardRefundItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      marginVertical: 5
   },
   quantityContainer:{ 
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
   },
   quantityRefundText: {
      fontSize: 18,
      color: '#003366',
      fontWeight: 700
   },
   quantityBtn: {
      width: 35,
      height: 30,
      borderRadius: 10,
   },
   refundResultCardContainer: {
      backgroundColor: '#FFF7ED',
      borderColor: '#FFE7CA',
      maxHeight: 180,
      marginVertical: 8
   },
   refundResultTitle: {
      fontSize: 15,
      color: '#003366',
      fontWeight: 600
   },
   refundResultTotalPrice: {
      fontSize: 16,
      color: '#F65B18',
      fontWeight: 700,
      maxWidth: 140,
      textAlign: 'right'
   },
   refundTotalTitleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10
   },
   refundItemText: {
      color: '#888C94',
      fontSize: 12
   },
   refundBtnContainer: {
      flexDirection: 'row',
      gap: 5,
      justifyContent: 'center',
      marginTop: 15
   },
   refundBtn: {
      width: 160
   },
   inputContainer: {
      height: 50,
      marginTop: 5
   }
})