import React from 'react'
import { View, StyleSheet } from 'react-native'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function ManagerClaimItemSkeleton() {
  return (
    <View style={styles.claimCard}>
      <View style={styles.claimCardTop}>
        <Skeleton width={44} height={44} borderRadius={22} />

        <View style={styles.claimCardHeadMid}>
          <Skeleton width={90} height={14} borderRadius={6} />
        </View>

        <Skeleton width={82} height={28} borderRadius={10} />
      </View>

      <Skeleton width={'55%'} height={18} borderRadius={6} />

      <Skeleton
        width={'40%'}
        height={12}
        borderRadius={6}
        style={{ marginTop: 8 }}
      />

      <Skeleton
        width={'35%'}
        height={12}
        borderRadius={6}
        style={{ marginTop: 8 }}
      />

      <View style={styles.descWrap}>
        <Skeleton width={'100%'} height={14} borderRadius={6} />
        <Skeleton
          width={'82%'}
          height={14}
          borderRadius={6}
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  claimCard: {
    backgroundColor: '#faf6f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0e6d8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2
  },

  claimCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },

  claimCardHeadMid: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8
  },

  descWrap: {
    marginTop: 12
  }
})