import React from 'react'
import { View, StyleSheet } from 'react-native'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function KeywordItemSkeleton() {
  return (
    <Card style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton
          width={'55%'}
          height={18}
          borderRadius={6}
        />

        <Skeleton
          width={80}
          height={26}
          borderRadius={999}
        />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Skeleton
            width={16}
            height={16}
            borderRadius={999}
          />

          <Skeleton
            width={'60%'}
            height={14}
            borderRadius={6}
          />
        </View>

        <Skeleton
          width={'75%'}
          height={12}
          borderRadius={6}
        />

        <Skeleton
          width={'50%'}
          height={12}
          borderRadius={6}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Skeleton
          width={'48%'}
          height={42}
          borderRadius={12}
        />

        <Skeleton
          width={'48%'}
          height={42}
          borderRadius={12}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    width: '99%',
    marginHorizontal: 'auto',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoContainer: {
    marginTop: 12,
    gap: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
})