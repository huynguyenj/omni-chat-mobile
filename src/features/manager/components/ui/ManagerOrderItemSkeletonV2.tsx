import React from 'react'
import { View, StyleSheet } from 'react-native'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function ManagerOrderCardSkeletonV2() {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <Skeleton width={140} height={18} borderRadius={6} />
        </View>

        <View style={styles.badgeRow}>
          <Skeleton width={72} height={24} borderRadius={8} />
          <Skeleton width={82} height={24} borderRadius={8} />
        </View>
      </View>



      {/* Customer */}
      <View style={styles.cusRow}>
        <Skeleton
          width={'55%'}
          height={13}
          borderRadius={4}
        />
      </View>

      {/* Date */}
      <Skeleton
        width={'40%'}
        height={12}
        borderRadius={4}
        style={{ marginTop: 8 }}
      />

      {/* Amount */}
      <Skeleton
        width={120}
        height={20}
        borderRadius={6}
        style={{ marginTop: 14 }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },

  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  badgeRow: {
    gap: 6,
  },

  cusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
})