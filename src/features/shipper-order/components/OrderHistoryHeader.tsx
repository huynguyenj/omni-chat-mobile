import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function OrderHistoryHeader() {
  return (
    <View style={styles.container}>
         <Text style={styles.mainTitle}>Lịch sử đơn hàng đã giao</Text>
         <Text style={styles.subText}>Theo dõi đơn hàng bạn đã hoàn thành</Text>
       </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 0.1,
            paddingVertical: 10
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