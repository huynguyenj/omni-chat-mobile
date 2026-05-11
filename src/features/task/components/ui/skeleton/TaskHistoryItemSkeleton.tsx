import React from 'react'
import { View, StyleSheet } from 'react-native'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function TaskHistoryItemSkeleton() {
  return (
    <Card style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.cardHeader}>
        {/* Status tag */}
        <Skeleton
          width={85}
          height={28}
          borderRadius={999}
        />

        {/* Content */}
        <View style={styles.contentContainer}>
          <Skeleton
            width={'70%'}
            height={18}
            borderRadius={6}
          />

          <View style={styles.dateContainer}>
            <Skeleton
              width={18}
              height={18}
              borderRadius={999}
            />

            <Skeleton
              width={110}
              height={14}
              borderRadius={6}
            />
          </View>
        </View>
      </View>

      {/* Customer name */}
      <Skeleton
        width={'60%'}
        height={15}
        borderRadius={6}
      />

      {/* Corner tag */}
      <View style={styles.typeTag}>
        <Skeleton
          width={55}
          height={12}
          borderRadius={6}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    gap: 12,
    marginTop: 12,
    overflow: 'hidden',
    backgroundColor: '#F2F4F7',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },

  cardHeader: {
    flexDirection: 'row',
    gap: 8,
  },

  contentContainer: {
    flex: 1,
    gap: 8,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  typeTag: {
    position: 'absolute',
    right: -22,
    bottom: -16,
    borderRadius: 200,
    width: 120,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E7FF',
    transform: [{ rotate: '-45deg' }],
  },
})