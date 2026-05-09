import React from 'react'
import { View, StyleSheet } from 'react-native'
import Skeleton from '@/components/ui/skeleton/Skeleton'
import Card from '@/components/ui/cards/Card'

export function ProductManagementItemSkeleton() {
  return (
    <Card style={styles.productCard}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={{ flex: 1 }}>
          <Skeleton width={'85%'} height={22} borderRadius={8} />
          <Skeleton
            width={'60%'}
            height={14}
            borderRadius={6}
            style={{ marginTop: 10 }}
          />
          <Skeleton
            width={'55%'}
            height={14}
            borderRadius={6}
            style={{ marginTop: 8 }}
          />
        </View>

        <Skeleton width={72} height={72} borderRadius={16} />
      </View>

      {/* INFO */}
      <View style={styles.infoContainer}>
        <View>
          <Skeleton width={70} height={12} borderRadius={6} />
          <Skeleton
            width={90}
            height={26}
            borderRadius={8}
            style={{ marginTop: 10 }}
          />
        </View>

        <View>
          <Skeleton width={70} height={12} borderRadius={6} />
          <Skeleton
            width={100}
            height={26}
            borderRadius={8}
            style={{ marginTop: 10 }}
          />
        </View>
      </View>

      {/* BUTTONS */}
      <View style={styles.btnContainer}>
        <Skeleton
          width={'68%'}
          height={48}
          borderRadius={12}
        />

        <Skeleton
          width={48}
          height={48}
          borderRadius={12}
        />

        <Skeleton
          width={48}
          height={48}
          borderRadius={12}
        />
      </View>
    </Card>
  )
}

export default function ProductManagementSkeleton() {
  return (
    <View style={styles.container}>
      {/* PRODUCT LIST */}
      {Array.from({ length: 2 }).map((_, index) => (
        <ProductManagementItemSkeleton key={index} />
      ))}

      {/* FLOATING CREATE BUTTON */}
      <View style={styles.floatingBtnContainer}>
        <Skeleton
          width={55}
          height={55}
          borderRadius={999}
          style={{backgroundColor: '#003366' }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 12,
  },

  overviewCard: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#003366'
  },

  productCard: {
    padding: 18,
    marginVertical: 4,
    gap: 18,
    width: '99%',
    marginHorizontal: 'auto',
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },

  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  btnContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },

  floatingBtnContainer: {
    position: 'absolute',
    right: 15,
    bottom: 20,
  },
})