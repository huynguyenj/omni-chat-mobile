import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function ProductBatchItemSkeleton() {
  return (
     <Card style={styles.card}>
          <Skeleton width={'85%'} height={25} borderRadius={8} />
          <View style={styles.subTextContainer}>
                <Skeleton width={'40%'} height={22} borderRadius={8} />
                <Skeleton width={'40%'} height={22} borderRadius={8} />
          </View>
        </Card>
  )
}

const styles = StyleSheet.create({
    card: {
      backgroundColor: '#FFE7CA',
      marginVertical: 5,
      gap: 5
    },
    subTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

})