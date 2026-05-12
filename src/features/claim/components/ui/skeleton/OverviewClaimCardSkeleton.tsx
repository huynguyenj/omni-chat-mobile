import React from 'react'
import { View, StyleSheet } from 'react-native'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function OverviewCardClaimSkeleton() {
  return (
    <Card style={styles.card}>
      <Skeleton
        width={120}
        height={14}
        borderRadius={6}
      />

      <View style={styles.spacing} />

      <Skeleton
        width={80}
        height={28}
        borderRadius={8}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: '100%',
  },

  spacing: {
    height: 12,
  },
})