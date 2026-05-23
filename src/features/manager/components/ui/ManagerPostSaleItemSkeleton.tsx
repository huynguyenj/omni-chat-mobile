import React from 'react'
import { View, StyleSheet } from 'react-native'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function ManagerPostSaleItemSkeleton() {
  return (
    <View style={styles.psrCard}>
      {/* Header */}
      <View style={styles.psrCardTop}>
        <View style={styles.psrCardTopLeft}>
          <Skeleton
            width={40}
            height={10}
            borderRadius={4}
          />

          <Skeleton
            width={130}
            height={18}
            borderRadius={6}
            style={{ marginTop: 6 }}
          />
        </View>

        <View style={styles.psrBadgeRow}>
          <Skeleton
            width={80}
            height={24}
            borderRadius={8}
          />

          <Skeleton
            width={70}
            height={24}
            borderRadius={8}
          />
        </View>
      </View>

      {/* Amount */}
      <Skeleton
        width={120}
        height={18}
        borderRadius={6}
        style={{ marginTop: 12 }}
      />

      {/* Date */}
      <Skeleton
        width={'45%'}
        height={12}
        borderRadius={4}
        style={{ marginTop: 10 }}
      />

      {/* Reason */}
      <Skeleton
        width={'100%'}
        height={14}
        borderRadius={4}
        style={{ marginTop: 12 }}
      />

      {/* Actions */}
      <View style={styles.psrActions}>
        <Skeleton
          style={{ flex: 1 }}
          height={42}
          borderRadius={8}
        />

        <Skeleton
          style={{ flex: 1 }}
          height={42}
          borderRadius={8}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  psrCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
    width: '95%',
    marginHorizontal: 'auto'
  },

  psrCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },

  psrCardTopLeft: {
    flex: 1,
    minWidth: 0,
  },

  psrBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    maxWidth: '52%',
  },

  psrActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
})