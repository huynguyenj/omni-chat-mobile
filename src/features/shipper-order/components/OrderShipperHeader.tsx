import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

type OrderShipperHeaderProps = {
   totalItems?: number
}

export default function OrderShipperHeader({ totalItems }: OrderShipperHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
            <View style={styles.activeDot}></View>
            <Text style={styles.statusText}>Trạng thái: đang hoạt động</Text>
      </View>
      <Text style={styles.mainTitle}>Đơn hàng cần giao</Text>
      <Text style={styles.subText}>Bạn có {totalItems ?? 0} đang chờ bạn giao</Text>
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 0.1,
            paddingVertical: 10
      },
      statusContainer: {
            flexDirection: 'row',
            gap: 5,
            alignItems: 'center'
      },
      activeDot: {
            width: 12,
            aspectRatio: 1,
            borderRadius: 150,
            backgroundColor:'#00B35D',
            shadowColor: '#4ee2a4',
            elevation: 7,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 5
      },
      statusText: {
            fontWeight: 600,
            textTransform: 'uppercase',
            color:'#8D9096',
            fontSize: 14
      },
      mainTitle: {
            fontWeight: 700,
            fontSize: 22,
            color: '#003366'
      },
      subText: {
            fontSize: 12,
            color: '#8D9096',
            fontWeight: 500
      }
})