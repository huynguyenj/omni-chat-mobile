import React from 'react'
import { View, StyleSheet } from 'react-native'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function ChatTemplateItemSkeleton() {
  return (
    <Card style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton
          width={140}
          height={28}
          borderRadius={6}
        />
      </View>

      {/* Content */}
      <View style={styles.infoContainer}>
        <Skeleton
          width={'95%'}
          height={25}
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
    borderRadius: 14,
    width: '99%',
    padding: 16,
    gap: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoContainer: {
    marginTop: 4,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
})