import React from 'react'
import { View, StyleSheet } from 'react-native'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function ChatItemSkeleton() {
  return (
    <View style={styles.chatItemContainer}>
      {/* Avatar */}
      <Skeleton
        width={56}
        height={56}
        borderRadius={999}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Skeleton
            width={'45%'}
            height={16}
            borderRadius={6}
          />

          <Skeleton
            width={50}
            height={12}
            borderRadius={6}
          />
        </View>

        {/* Message */}
        <View style={styles.footer}>
          <Skeleton
            width={'75%'}
            height={14}
            borderRadius={6}
          />

          <Skeleton
            width={22}
            height={22}
            borderRadius={999}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
})