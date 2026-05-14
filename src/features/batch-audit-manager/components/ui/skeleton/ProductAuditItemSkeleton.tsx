import React from 'react'
import { View, StyleSheet } from 'react-native'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function ProductAuditItemSkeleton() {
  return (
    <Card style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.staffContainer}>
          <Skeleton
            width={110}
            height={12}
            borderRadius={6}
          />

          <View style={{ height: 8 }} />

          <Skeleton
            width={140}
            height={18}
            borderRadius={8}
          />
        </View>

        <Skeleton
          width={95}
          height={32}
          borderRadius={999}
        />
      </View>

      {/* Quantity */}
      <View style={styles.quantityWrapper}>
        {/* Old value */}
        <View style={styles.oldValueBox}>
          <Skeleton
            width={80}
            height={12}
            borderRadius={6}
          />

          <View style={{ height: 10 }} />

          <Skeleton
            width={55}
            height={28}
            borderRadius={8}
          />
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Skeleton
            width={28}
            height={28}
            borderRadius={999}
          />
        </View>

        {/* New value */}
        <View style={styles.newValueBox}>
          <Skeleton
            width={90}
            height={12}
            borderRadius={6}
          />

          <View style={{ height: 10 }} />

          <Skeleton
            width={65}
            height={32}
            borderRadius={8}
          />

          <View style={{ height: 6 }} />

          <Skeleton
            width={40}
            height={14}
            borderRadius={6}
          />
        </View>
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Skeleton
          width={'80%'}
          height={14}
          borderRadius={6}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Skeleton
          width={120}
          height={12}
          borderRadius={6}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 18,
    padding: 16,
    gap: 16,
    width: '99%',
    marginHorizontal: 'auto',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },

  staffContainer: {
    flex: 1,
  },

  quantityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  oldValueBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  newValueBox: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },

  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  descriptionContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
})