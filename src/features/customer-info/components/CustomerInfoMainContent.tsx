import { View, Text, StyleSheet, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import useGetCustomerInfo from '../hooks/useGetCustomerInfo'
import Card from '@/components/ui/cards/Card'
import { Calendar, DollarSign, Mail, MapPin, Pencil, Phone, ShoppingCart } from 'lucide-react-native'
import { formatDate } from '@/utils/format'
import CustomerMainContentSkeleton from './ui/skeleton/CustomerMainContentSkeleton'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import Button from '@/components/ui/buttons/Button'
import Input from '@/components/ui/inputs/Input'
import useUpdateCustomerInfo from '../hooks/useUpdateCustomerInfo'
import { Controller } from 'react-hook-form'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

type CustomerInfoMainContentProps = {
      conversationId: string
}

type InfoRowProps = {
  icon: any
  text?: string
}

function InfoRow({ icon: Icon, text }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Icon size={18} color="#3366CC" />
      <Text style={styles.infoText}>{text ?? 'Chưa có thông tin'}</Text>
    </View>
  )
}

export default function CustomerInfoMainContent({ conversationId }: CustomerInfoMainContentProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { customerInfo, loading, setIsRefetch } = useGetCustomerInfo({ conversationId: conversationId })
  const { control, errors, handleSubmit, loading: updateLoading, onSubmit, reset } = useUpdateCustomerInfo({ customerId: customerInfo?.id, setIsRefetch: setIsRefetch })
  const handleOpenEdit = () => {
    setIsEditOpen(prevState => !prevState)
    reset({
      customerName: customerInfo?.customerName,
      address: customerInfo?.address,
      avatarUrl: customerInfo?.avatarUrl,
      email: customerInfo?.email,
      phoneNumber: customerInfo?.customerPhone
    })
  }  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      { loading ? 
      <CustomerMainContentSkeleton/>
      :
      <>
      
            <Card style={styles.headerCard}>
              <View style={styles.headerRow}>
                <Image
                      source={customerInfo?.avatarUrl ?  { uri: customerInfo.avatarUrl } : require('@assets/avatar-sample.jpg') }
                      style={styles.avatar}
                />

                <View style={styles.headerInfo}>
                      <Text style={styles.name}>{customerInfo?.customerName}</Text>
                      <Text style={styles.provider}>{customerInfo?.providerName}</Text>
                </View>
              </View>
                <Button style={styles.editBtn} icon={{ iconName: Pencil, iconDirection: 'center' }} onPress={handleOpenEdit}/>
            </Card>

          <View style={styles.highlightContainer}>
            <Card style={styles.highlightCard}>
                  <ShoppingCart size={20} color="#3366CC" />
                  <Text style={styles.highlightLabel}>Tổng đơn</Text>
                  <Text style={styles.highlightValueBlue}>{customerInfo?.totalOrder}</Text>
            </Card>
            <Card style={styles.highlightCard}>
                  <DollarSign size={20} color="#2ECC71" />
                  <Text style={styles.highlightLabel}>Tổng chi</Text>
                  <Text style={styles.highlightValueGreen}>
                        {customerInfo?.totalPay.toLocaleString()}đ
                  </Text>
            </Card>
            </View>
            <Card>
                  <InfoRow icon={Phone} text={customerInfo?.customerPhone} />
                  <InfoRow icon={Mail} text={customerInfo?.email} />
                  <InfoRow icon={MapPin} text={customerInfo?.address} />
                  <InfoRow icon={Calendar} text={`Bắt đầu hỗ trợ: ${customerInfo?.timeStartSupport ? formatDate(customerInfo?.timeStartSupport): 'N/A'}`} />
                  <InfoRow icon={Calendar} text={`Khách hàng từ: ${customerInfo?.becomeCustomerDate ? formatDate(customerInfo?.becomeCustomerDate): 'N/A'}`} />
            </Card>
      </>
       }
       <ModalCustom isOpen={isEditOpen} onClose={handleOpenEdit}>
          <Text style={styles.modalTitle}>Cập nhật thông tin khách hàng</Text>
          <View>
            <Controller
                control={control}
                name='customerName'
                render={({ field: { onBlur, value, onChange } }) => (
                        <Input 
                          label='Tên khách hàng' 
                          placeholder='Nguyen Van A' 
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          error={errors.customerName?.message}/>             
                )
                }
            />
            <Controller
                control={control}
                name='address'
                render={({ field: { onBlur, value, onChange } }) => (
                        <Input 
                          label='Địa chỉ' 
                          placeholder='Thành phố Hồ Chí Minh' 
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          error={errors.address?.message}/>             
                )
                }
            />
            <Controller
                control={control}
                name='email'
                render={({ field: { onBlur, value, onChange } }) => (
                        <Input 
                          label='Email' 
                          placeholder='nguyenvana@gmail.com' 
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          error={errors.email?.message}/>             
                )
                }
            />
            <Controller
                control={control}
                name='phoneNumber'
                render={({ field: { onBlur, value, onChange } }) => (
                        <Input 
                          label='Số điện thoại' 
                          placeholder='0961152578' 
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          error={errors.phoneNumber?.message}/>             
                )
                }
            />
             <Controller
                control={control}
                name='avatarUrl'
                render={({ field: { onBlur, value, onChange } }) => (
                        <Input 
                          label='Link ảnh' 
                          placeholder='https://image.jpg' 
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />             
                )
                }
            />
          </View>
          <View style={styles.actions}>
              {updateLoading?
                  <LoadingCircle/>
                  :
                  <>
                        <Button
                              content="Hủy"
                              variant="outline"
                              style={styles.actionBtn}
                              onPress={handleOpenEdit}
                        />

                        <Button
                              content="Lưu"
                              variant="secondary"
                              icon={{ iconName: Pencil, iconDirection: 'left' }}
                              style={styles.actionBtn}
                              onPress={handleSubmit(onSubmit)}
                        />
                  </>
              }
            </View>
       </ModalCustom>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    gap: 12,
  },

  headerCard: {
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    objectFit: 'cover'
  },

  headerInfo: {
    flexDirection: 'column',
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003366',
  },

  provider: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  highlightContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  highlightCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 15,
  },

  highlightLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  highlightValueBlue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3366CC',
  },

  highlightValueGreen: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2ECC71',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },

  infoText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  editBtn: {
    width: 40,
    aspectRatio: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight:600,
    marginVertical: 10,
    textAlign: 'center'
  },
    actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  actionBtn: {
    flex: 1,
  },

})