import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Card from '@/components/ui/cards/Card'

type SystemOverviewCardProps = {
      totalStaff: number
}

export default function OverviewCardStaff({ totalStaff = 0 }: SystemOverviewCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.subTitle}>Tổng quan hệ thống</Text>

      <Text style={styles.mainText}>
        {totalStaff} Nhân sự hoạt động
      </Text>

      {/* <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>12 Đang ngoại tuyến</Text>
        </View>
      </View> */}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F3D73',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flex: 0.15,
    marginBottom: 5
  },

  subTitle: {
    color: '#A7C4E0',
    fontSize: 13,
    marginBottom: 8
  },

  mainText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 16
  },

  badgeContainer: {
    flexDirection: 'row',
    gap: 10
  },

  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },

  badgeText: {
    color: '#D1E4FF',
    fontSize: 12,
    fontWeight: '500'
  },

  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,150,0.15)'
  },

  successText: {
    color: '#00E096',
    fontSize: 12,
    fontWeight: '600'
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: '#00E096',
    marginRight: 6
  }
})