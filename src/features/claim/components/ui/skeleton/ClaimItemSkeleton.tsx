import React from 'react'
import { View, StyleSheet } from 'react-native'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function ClaimItemSkeleton() {
  return (
    <Card
      variant="lightGrey"
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleContainer}>
          <Skeleton
            width={120}
            height={18}
            borderRadius={6}
          />

          <Skeleton
            width={90}
            height={26}
            borderRadius={999}
          />
        </View>

        <Skeleton
          width={70}
          height={12}
          borderRadius={6}
        />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Skeleton
          width={'90%'}
          height={14}
          borderRadius={6}
        />

        <Skeleton
          width={'75%'}
          height={14}
          borderRadius={6}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    width: '99%',
    marginHorizontal: 'auto',
  },

  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  itemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  contentContainer: {
    gap: 10,
    marginLeft: 15,
  },
})