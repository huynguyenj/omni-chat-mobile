import { View, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function TicketMainContentSkeleton() {
  return (
    <View style={styles.container}>
      
      <Card variant="primary">
        <Skeleton
          width={130}
          height={12}
          style={styles.darkSkeleton}
        />

        <View style={styles.cardMainTextContainer}>
          <Skeleton
            width={45}
            height={28}
            borderRadius={6}
            style={styles.lightSkeleton}
          />

          <Skeleton
            width={120}
            height={12}
            borderRadius={6}
            style={styles.darkSkeleton}
          />
        </View>
      </Card>

      <View style={styles.listContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Card
              key={index}
              style={styles.ticketCard}
            >
              <Skeleton
                width={85}
                height={28}
                borderRadius={10}
                style={styles.statusSkeleton}
              />

              <View style={styles.mainTicketContentContainer}>
                
                <Skeleton
                  width="70%"
                  height={18}
                />

                <Skeleton
                  width="55%"
                  height={12}
                  style={{ marginTop: 12 }}
                />

                <Skeleton
                  width="60%"
                  height={12}
                  style={{ marginTop: 8 }}
                />

                <Skeleton
                  width="45%"
                  height={12}
                  style={{ marginTop: 8 }}
                />
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginVertical: 10,
  },

  cardMainTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginVertical: 5,
  },

  listContainer: {
    maxHeight: 620,
    paddingHorizontal: 5,
    marginTop: 10,
  },

  ticketCard: {
    position: 'relative',
    borderRadius: 10,
    marginVertical: 5,
    minHeight: 140,
  },

  statusSkeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 0
  },

  mainTicketContentContainer: {
    marginTop: 20,
  },

  lightSkeleton: {
    backgroundColor: 'rgba(255,255,255,0.45)',
  },

  darkSkeleton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
})