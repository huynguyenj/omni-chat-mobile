import { View, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import Card from '@/components/ui/cards/Card'
import Skeleton from '@/components/ui/skeleton/Skeleton'

export default function ConversationTaskSkeleton() {
  return (
    <View style={styles.container}>
      
      <Card variant="primary">
        <Skeleton
          width={120}
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
            width={140}
            height={12}
            borderRadius={6}
            style={styles.darkSkeleton}
          />
        </View>
      </Card>

      <View style={styles.listContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} style={styles.taskCard}>
              <View style={styles.taskContentContainer}>

                {/* LEFT CONTENT */}
                <View style={{ flex: 1 }}>
                  <Skeleton width="75%" height={18} />

                  <Skeleton
                    width={90}
                    height={28}
                    borderRadius={999}
                    style={{ marginTop: 10 }}
                  />
                </View>

                {/* RIGHT DATE */}
                <Skeleton width={70} height={12} />
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
    marginVertical: 8,
  },

  listContainer: {
    maxHeight: 620,
    paddingHorizontal: 5,
    marginTop: 10,
  },

  taskCard: {
    marginVertical: 5,
    flexDirection: 'row',
    gap: 10,
  },

  taskContentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },

  lightSkeleton: {
    backgroundColor: 'rgba(255,255,255,0.45)',
  },

  darkSkeleton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
})