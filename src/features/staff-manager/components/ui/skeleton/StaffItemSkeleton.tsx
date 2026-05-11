import React from 'react'
import { View, StyleSheet } from 'react-native'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function StaffItemSkeleton() {
  return (
    <Card style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton
          width={50}
          height={50}
          borderRadius={12}
        />

        <View style={styles.headerContent}>
          <Skeleton
            width={140}
            height={16}
            borderRadius={6}
          />

          <Skeleton
            width={180}
            height={12}
            borderRadius={6}
            style={styles.spacingTop}
          />
        </View>
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
            width={'85%'}
            height={14}
            borderRadius={6}
          />
        </View>

        <View style={styles.row}>
          <Skeleton
            width={16}
            height={16}
            borderRadius={999}
          />

          <Skeleton
            width={'75%'}
            height={14}
            borderRadius={6}
          />
        </View>
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
    borderRadius: 16,
    width: '99%',
    marginHorizontal: 'auto',
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  spacingTop: {
    marginTop: 8,
  },

  infoContainer: {
    gap: 10,
    marginVertical: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
})