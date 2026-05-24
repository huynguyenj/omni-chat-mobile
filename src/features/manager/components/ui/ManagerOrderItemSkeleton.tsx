import React from 'react'
import { View, StyleSheet } from 'react-native'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function ManagerOrderItemSkeleton() {
  return (
    <View style={styles.orderCard}>
      {/* Header */}
      <View style={styles.orderTop}>
        <Skeleton width={140} height={16} borderRadius={6} />
      </View>

      {/* Status */}
      <View style={styles.orderStatusRow}>
        <View style={styles.statusCol}>
          <Skeleton width={90} height={10} borderRadius={4} />
          <Skeleton
            width={100}
            height={24}
            borderRadius={8}
            style={{ marginTop: 8 }}
          />
        </View>

        <View style={styles.statusCol}>
          <Skeleton width={100} height={10} borderRadius={4} />
          <Skeleton
            width={110}
            height={24}
            borderRadius={8}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>

      {/* Info */}
      <Skeleton
        width={'85%'}
        height={16}
        borderRadius={6}
        style={{ marginTop: 12 }}
      />

      <Skeleton
        width={'55%'}
        height={13}
        borderRadius={4}
        style={{ marginTop: 8 }}
      />

      <Skeleton
        width={'40%'}
        height={12}
        borderRadius={4}
        style={{ marginTop: 6 }}
      />

      {/* Actions */}
      <View style={styles.assignRow}>
        <Skeleton
          style={{ flex: 1 }}
          height={42}
          borderRadius={10}
        />

        <Skeleton
          width={80}
          height={42}
          borderRadius={10}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  orderStatusRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },

  statusCol: {
    flex: 1,
    minWidth: 0,
  },

  assignRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
})