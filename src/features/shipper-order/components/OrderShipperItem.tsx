import { View, Text, FlatList, StyleSheet } from 'react-native'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { OrderShipperType } from '../types/order-shipper'
import Card from '@/components/ui/cards/Card'
import Tag from '@/components/ui/tags/Tag'
import { MapPin, Phone, Van } from 'lucide-react-native'
import { formatDate } from '@/utils/format'
import Button from '@/components/ui/buttons/Button'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import useUpdateCompleteOrder from '../hooks/useUpdateCompleteOrder'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

type OrderShipperItemProps = {
   data: OrderShipperType
   onRefresh: Dispatch<SetStateAction<boolean>>
}

export default function OrderShipperItem({ data, onRefresh }: OrderShipperItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { handleCompleteOrder, loading } = useUpdateCompleteOrder({ onRefresh: onRefresh })
  const handleOpenModal = () => {
    setIsModalOpen(prev => !prev)
  }
  
  return (
    <Card style={styles.container}>
      <View style={styles.orderHeaderContainer}>
        <Text style={styles.orderCode}>#{data.code}</Text>
          <Tag variant={ data.deliveryStatus === 'Pending' ? 'warning' : 'default' }>
            <Text style={{ color: '#ffffff', fontWeight: 600 }}>{data.deliveryStatus === 'Pending' ? 'Chờ ship' : data.deliveryStatus}</Text>
          </Tag>
      </View>
      <View style={styles.tagContainer}>
          <Tag variant='success'><Text style={styles.priceText}>{data.totalAmount.toLocaleString()}đ</Text></Tag>
      </View>
      <Text style={styles.name}>
        {data.customerName}
      </Text>
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <MapPin size={18}/>
          <Text style={styles.textInfo}>{data.customerAddress}</Text>
        </View>
        <View style={styles.textContainer}>
          <Phone size={18}/>
          <Text style={styles.textInfo}>{data.customerPhoneNumber}</Text>
        </View>
        <View style={styles.textContainer}>
          <Van size={18}/>
          <Text style={styles.textInfo}>
          {formatDate(data.deliveriedDate)}
          </Text>
        </View>
      </View>
      <View style={styles.btnContainer}>
        <Button variant='outline' content='Xem chi tiết đơn hàng' onPress={handleOpenModal}/>
        { loading ?
            <LoadingCircle size={40}/>
          :
          <Button variant='secondary' content='Hoàn thành' onPress={() => handleCompleteOrder(data.id)}/>
        }
      </View>
        <ModalCustom isOpen={isModalOpen} onClose={handleOpenModal}>
          <Text style={styles.modalTitle}>Danh sách sản phẩm</Text>
           <View style={styles.modalContainer}>
              <FlatList
                data={data.orderItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.productName}>{item.productName}</Text>
                      <Text style={styles.quantity}>Tổng số lượng sản phẩm: x{item.quantity}</Text>
                      <Text style={styles.price}>
                        Giá lẻ: {(item.itemsPrice).toLocaleString()}đ
                      </Text>
                    </View>
                  </View>
                )}
              />
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Tổng:</Text>
              <Text style={styles.totalValue}>
                {data.totalAmount.toLocaleString()}đ
              </Text>
            </View>
          </View>
        </ModalCustom>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth:1,
    borderColor: '#dfe3ea',
    borderLeftColor:'#3366CC',
    borderLeftWidth: 5,
    marginVertical: 10
  },
  orderHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginVertical: 5
  },
  orderCode: {
    color: '#3366CC',
    fontWeight: 700,
    fontSize: 14
  },
  priceText: {
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 16
  },
  infoContainer: {
    paddingHorizontal: 10,
    marginVertical: 10
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: 600
  },
  textInfo: {
    color: '#4f5258',
    fontSize: 14
  },
  btnContainer: {
    flexDirection: 'column',
    gap: 7,
    alignItems: 'center',
  },
  modalContainer: {
  padding: 15,
},

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#003366'
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#ebeef5',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 4,
  },

  itemInfo: {
    flexDirection: 'column',
    gap: 3
  },

  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3366CC'
  },

  quantity: {
    fontSize: 13,
    color: '#888',
  },

  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ECC71'
  },

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '600'
  },

  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3366CC'
  }
})