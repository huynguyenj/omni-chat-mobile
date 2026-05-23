import React from 'react'
import { View, StyleSheet } from 'react-native'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function InvoiceItemSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Skeleton width={70} height={14} borderRadius={4} />
        <Skeleton width={40} height={16} borderRadius={4} />
      </View>

      <View style={styles.cardRow}>
        <Skeleton width={110} height={14} borderRadius={4} />
        <Skeleton width={'55%'} height={16} borderRadius={4} />
      </View>

      <View style={styles.cardRow}>
        <Skeleton width={50} height={14} borderRadius={4} />
        <View style={styles.emailRow}>
          <Skeleton width={'65%'} height={14} borderRadius={4} />
          <Skeleton width={18} height={18} borderRadius={9} />
        </View>
      </View>

      <View style={styles.cardRow}>
        <Skeleton width={40} height={14} borderRadius={4} />
        <Skeleton width={'40%'} height={14} borderRadius={4} />
      </View>

      <View style={styles.cardRow}>
        <Skeleton width={90} height={14} borderRadius={4} />

        <View style={styles.methodPill}>
          <Skeleton width={14} height={14} borderRadius={7} />
          <Skeleton width={90} height={14} borderRadius={4} />
        </View>
      </View>

      <View style={styles.cardRow}>
        <Skeleton width={60} height={14} borderRadius={4} />
        <Skeleton width={'50%'} height={14} borderRadius={4} />
      </View>

      <View style={styles.cardRow}>
        <Skeleton width={70} height={14} borderRadius={4} />
        <Skeleton width={'50%'} height={14} borderRadius={4} />
      </View>

      <View style={styles.cardRow}>
        <Skeleton width={95} height={14} borderRadius={4} />
        <Skeleton width={120} height={18} borderRadius={4} />
      </View>

      <View style={[styles.cardRow, styles.cardRowLast]}>
        <Skeleton width={80} height={14} borderRadius={4} />

        <View style={styles.statusRow}>
          <Skeleton width={18} height={18} borderRadius={9} />
          <Skeleton width={90} height={16} borderRadius={4} />
        </View>
      </View>

      <View style={styles.progressTrack}>
        <Skeleton width={'65%'} height={5} borderRadius={999} />
      </View>
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
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },

  cardRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },

  emailRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },

  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  progressTrack: {
    marginTop: 10,
  },
})