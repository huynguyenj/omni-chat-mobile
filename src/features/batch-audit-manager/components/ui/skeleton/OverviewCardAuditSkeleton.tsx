import React from 'react'
import { StyleSheet } from 'react-native'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function OverviewCardAuditSkeleton() {
  return (
    <Card style={styles.card}>
      <Skeleton
        width={130}
        height={14}
        borderRadius={6}
      />

      <Skeleton
        width={220}
        height={30}
        borderRadius={8}
        style={styles.mainSkeleton}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#003366',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 5,
  },

  mainSkeleton: {
    marginTop: 14,
  },
})