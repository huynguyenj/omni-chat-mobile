import { View, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function CustomerMainContentSkeleton() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Skeleton width={70} height={70} borderRadius={50} />

          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      </Card>

      <View style={styles.highlightContainer}>
        <Card style={styles.highlightCard}>
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width={60} height={12} />
          <Skeleton width={40} height={16} />
        </Card>

        <Card style={styles.highlightCard}>
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width={60} height={12} />
          <Skeleton width={80} height={16} />
        </Card>
      </View>

      <Card>
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} style={styles.infoRow}>
            <Skeleton width={18} height={18} borderRadius={4} />
            <Skeleton width="80%" height={13} />
          </View>
        ))}
      </Card>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    gap: 12,
  },

  headerCard: {
    paddingVertical: 20,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  highlightContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  highlightCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 15,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
})