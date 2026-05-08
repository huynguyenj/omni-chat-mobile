import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function CustomerOrderMainContentSkeleton() {
  return (
    <View style={styles.container}>
      {/* SUMMARY CARD */}
      <Card variant="primary">
        <Skeleton width={120} height={14} />

        <View style={styles.cardMainContainer}>
          <Skeleton width={50} height={28} />
          <Skeleton width={130} height={14} />
        </View>
      </Card>

      {/* FILTER */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} style={styles.filterItem}>
              <Skeleton
                width={90}
                height={36}
                borderRadius={16}
              />
            </View>
          ))}
        </ScrollView>

        <Skeleton width={40} height={40} borderRadius={10} />
      </View>

      {/* ORDER LIST */}
      <View style={styles.listContainer}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} style={styles.orderCard}>
            {/* ICON */}
            <Skeleton
              width={40}
              height={30}
              borderRadius={10}
            />

            {/* CONTENT */}
            <View style={styles.orderContent}>
              {/* CODE + PRICE */}
              <View style={styles.textContainer}>
                <Skeleton width={100} height={18} />
                <Skeleton width={90} height={18} />
              </View>

              {/* TIME */}
              <View style={styles.timeContainer}>
                <Skeleton width={60} height={12} />
                <Skeleton width={10} height={12} />
                <Skeleton width={90} height={12} />
              </View>

              {/* STATUS */}
              <Skeleton
                width={90}
                height={20}
                borderRadius={999}
              />

              {/* BUTTON */}
              <View style={styles.btnContainer}>
                <Skeleton
                  width={115}
                  height={30}
                  borderRadius={100}
                />
                <Skeleton
                  width={115}
                  height={30}
                  borderRadius={100}
                />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    gap: 12,
  },

  skeleton: {
    backgroundColor: '#E5E7EB',
  },

  cardMainContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 10,
  },

  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },

  filterItem: {
    marginRight: 10,
  },

  listContainer: {
    marginTop: 5,
  },

  orderCard: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 5,
  },

  orderContent: {
    flex: 1,
    gap: 10,
  },

  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 5,
    marginTop: 5,
  },
})