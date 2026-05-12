import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Card from '@/components/ui/cards/Card'
import { BatchType } from '@/features/order/types/batch-type'
import { formatDate } from '@/utils/format'

export default function ProductBatchItem({ item }: {item: BatchType}) {
  return (
    <Card style={styles.card}>
      <Text style={styles.codeText}>#{item.code}</Text>
      <View style={styles.subTextContainer}>
            <Text style={styles.subText}>HSD: {formatDate(item.expiryDate)}</Text>
            <Text style={styles.subText}>x{item.quantity}</Text>
      </View>
    </Card>
  )
}
const styles = StyleSheet.create({
    card: {
      backgroundColor: '#FFE7CA',
      marginVertical: 5
    },
    codeText: {
      color: '#003366',
      fontWeight: 600,
      fontSize: 15
    },
    subTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    subText:{
      color: '#F65B18',
      fontSize: 12,
      fontWeight: 500
    }
})