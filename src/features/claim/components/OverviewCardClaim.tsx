import { Text, StyleSheet } from 'react-native'
import React from 'react'
import Card from '@/components/ui/cards/Card'

export default function OverviewCardClaim({ totalItem }: { totalItem: number }) {
  return (
     <Card>
         <Text style={styles.cardTitle}>Số lượng đơn</Text>
         <Text style={styles.cardContent}>{totalItem}</Text>
      </Card>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 0.75,
            marginTop: 5,
      },
      cardTitle: {
            color: '#5A5E65',
            fontSize: 14,
            textTransform:'uppercase'
      },
      cardContent: {
            color: '#003366',
            fontSize: 16,
            fontWeight: 700,
            marginTop: 5
      },


})