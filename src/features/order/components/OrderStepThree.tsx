import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React, { useMemo } from 'react'
import useContextValid from '@/hooks/useContextValid'
import OrderContext from '../context/OrderProvider'
import Button from '@/components/ui/buttons/Button'
import ProductItemV3 from './ProductItemV3'
import { ProductDetailType } from '../types/product-type'
import { OrderItems, OrderItemType, OrderRequestType } from '../types/order-type'
import useCreateOrder from '../hooks/useCreateOrder'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

export default function OrderStepThree({ activeCustomerId }: { activeCustomerId: string }) {
  const { handleNextStep, handlePreviousStep, listBatchChosen, listProductChose } = useContextValid(OrderContext)
  const { handleOrder, loading } = useCreateOrder()
  const listAllBatch = useMemo(() => {
    return Array.from(listBatchChosen.values()).flat()
  }, [])
  const calculateTotalPriceOfEachProduct = () => {
    const listTotalPerProduct = []
    for (let i = 0; i < listProductChose.length; i++) {
      const listBatchEachCurrentProduct = listBatchChosen.get(listProductChose[i].id)
      if (!listBatchEachCurrentProduct) {
        listTotalPerProduct.push(0)
        continue
      }
      const totalBatch = listBatchEachCurrentProduct?.reduce((total, item) => {
        return total + item.quantity
      }, 0)
      
      const totalPrice = totalBatch * listProductChose[i].price
      
      listTotalPerProduct.push(totalPrice)
    }
    return listTotalPerProduct.reduce((total, totalPriceOfProduct) => {
      return total + totalPriceOfProduct
    }, 0)
  }

  const handleOrderResolver = () => {
    const orderList: OrderItems[] = []
    listAllBatch.forEach((batch) => {
      const orderItem: OrderItems = {
        productBatchId: batch.id,
        quantity: batch.quantity
      }
      orderList.push(orderItem)
    })
    const orderRequestType: OrderRequestType = {
      customerId: activeCustomerId,
      name: 'Tạo đơn hàng cho khách hàng',
      orderItems: orderList
    }
    handleOrder(orderRequestType)
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác nhận đơn hàng</Text>
      <Text style={styles.subtitle}>Vui lòng kiểm tra lại thông tin đơn hàng</Text>
      <View style={styles.listContainer}>
        <ScrollView>
            {listProductChose.map((product) => (
              <ProductItemV3 key={product.id} item={product}/>
            ))}
        </ScrollView>
      </View>
      <View style={styles.totalProductContainer}>
        <View style={styles.innerTotalContainer}>
          <Text style={styles.totalText}>Tổng sản phẩm: </Text>
          <Text style={styles.totalNumberText}>{listProductChose.length} sản phẩm</Text>
        </View>
        <View style={styles.innerTotalContainer}>
          <Text style={styles.totalText}>Tổng số lô: </Text>
          <Text style={styles.totalNumberText}>{listAllBatch.length} lô</Text>
        </View>
      </View>
      <View style={styles.totalPriceContainer}>
        <Text style={styles.textPrice}>Tổng số tiền thanh toán</Text>
        <Text style={styles.totalPriceText}>{calculateTotalPriceOfEachProduct().toLocaleString()}đ</Text>
      </View>
      <View style={styles.btnContainer}>
        { loading ?
        <LoadingCircle/>
        :
        <>
          <Button variant='outline' style={styles.btnLeft} content='Quay lại' onPress={handlePreviousStep}/>
          <Button style={styles.btnRight} content='Tạo đơn' onPress={handleOrderResolver}/>
        </>
        }
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#003366'
  },
  subtitle: {
    fontSize: 16
  },
  btnContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent:'center',
    alignItems: 'center'
  },
  btnRight: {
    width: 220,
    height: 60
  },
  btnLeft: {
    width: 140,
    height: 60
  },
  unableBtn: {
    backgroundColor: '#888C94',
  },
  listContainer: {
    minHeight: 100,
    maxHeight: 350,
    marginVertical: 10
  },
  totalProductContainer: {
   
    backgroundColor: '#dbe0e8',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10
  },
  innerTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalText: {
    fontWeight: 600,
    color: '#888C94'
  },
  totalNumberText: {
    fontWeight: 600,
    color: '#003366',
    fontSize: 15
  },
  totalPriceContainer: {
    backgroundColor: '#003366',
    paddingHorizontal: 15,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 16
  },
  textPrice: {
    fontSize: 12,
    color: '#E0E3E6'
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#ffffff'
  }
})