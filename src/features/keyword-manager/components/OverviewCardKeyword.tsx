import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Card from '@/components/ui/cards/Card'

type SystemOverviewCardProps = {
      totalKeywords: number
}

export default function OverviewCardKeyword({ totalKeywords = 0 }: SystemOverviewCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.subTitle}>Tổng quan hệ thống</Text>

      <Text style={styles.mainText}>
        {totalKeywords} từ khóa tất cả
      </Text>

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

})