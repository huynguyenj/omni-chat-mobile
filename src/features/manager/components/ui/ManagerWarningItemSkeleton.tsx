import React from 'react'
import { View, StyleSheet } from 'react-native'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function ManagerWarningItemSkeleton() {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Skeleton width={16} height={16} borderRadius={999} />
          <Skeleton width={150} height={16} borderRadius={6} />
        </View>

        <Skeleton width={90} height={24} borderRadius={8} />
      </View>

      {/* Meta */}
      <View style={styles.metaGrid}>
        <View style={styles.metaCol}>
          <Skeleton width={70} height={10} borderRadius={4} />
          <Skeleton
            width={'90%'}
            height={14}
            borderRadius={4}
            style={{ marginTop: 6 }}
          />
        </View>

        <View style={styles.metaCol}>
          <Skeleton width={80} height={10} borderRadius={4} />
          <Skeleton
            width={'85%'}
            height={14}
            borderRadius={4}
            style={{ marginTop: 6 }}
          />
        </View>
      </View>

      {/* Reason */}
      <View style={styles.reasonBox}>
        <Skeleton width={'35%'} height={12} borderRadius={4} />
        <Skeleton
          width={'100%'}
          height={12}
          borderRadius={4}
          style={{ marginTop: 8 }}
        />
        <Skeleton
          width={'95%'}
          height={12}
          borderRadius={4}
          style={{ marginTop: 6 }}
        />
        <Skeleton
          width={'75%'}
          height={12}
          borderRadius={4}
          style={{ marginTop: 6 }}
        />
      </View>

      {/* Footer */}
      <View style={styles.cardFooterRow}>
        <Skeleton width={120} height={24} borderRadius={8} />
        <Skeleton width={90} height={24} borderRadius={10} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderTopWidth: 4,
    borderTopColor: '#d1d5db',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    width: '95%',
    marginHorizontal: 'auto',
    marginTop: 5
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },

  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  metaGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },

  metaCol: {
    flex: 1,
  },

  reasonBox: {
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 8,
    padding: 10,
    minHeight: 64,
    marginBottom: 12,
  },

  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
})