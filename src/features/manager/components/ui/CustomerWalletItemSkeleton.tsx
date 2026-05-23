import React from 'react'
import { View, StyleSheet } from 'react-native'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function CustomerWalletItemSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Skeleton width={56} height={56} borderRadius={28} />

        <View style={styles.cardHeaderText}>
          <Skeleton width={'60%'} height={18} borderRadius={6} />
          <Skeleton
            width={'85%'}
            height={13}
            borderRadius={6}
            style={{ marginTop: 8 }}
          />
          <Skeleton
            width={'50%'}
            height={13}
            borderRadius={6}
            style={{ marginTop: 6 }}
          />
        </View>
      </View>

      <View style={styles.activityBlock}>
        <Skeleton width={140} height={14} borderRadius={6} />

        <Skeleton
          width={'70%'}
          height={13}
          borderRadius={6}
          style={{ marginTop: 10 }}
        />

        <Skeleton
          width={'90%'}
          height={13}
          borderRadius={6}
          style={{ marginTop: 8 }}
        />
      </View>

      <Skeleton width={'100%'} height={48} borderRadius={12} />
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
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },

  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },

  activityBlock: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  }
})