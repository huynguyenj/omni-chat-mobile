import { View, Text, StyleSheet, ScrollView, Image } from 'react-native'
import React from 'react'
import useGetCustomerInfo from '../hooks/useGetCustomerInfo'
import Card from '@/components/ui/cards/Card'
import { Calendar, DollarSign, Mail, MapPin, Phone, ShoppingCart } from 'lucide-react-native'
import { formatDate } from '@/utils/format'
import CustomerMainContentSkeleton from './ui/skeleton/CustomerMainContentSkeleton'

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
  const { customerInfo, loading, setIsRefetch } = useGetCustomerInfo({ conversationId: conversationId })  
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
})