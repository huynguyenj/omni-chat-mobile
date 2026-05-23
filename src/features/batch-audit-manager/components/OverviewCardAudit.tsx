import { Text, StyleSheet } from 'react-native'
import React from 'react'
import Card from '@/components/ui/cards/Card'

type OverviewCardAuditProps = {
      totalItems: number
}

export default function OverviewCardAudit({ totalItems }: OverviewCardAuditProps) {
  return (
    <Card style={styles.card}>
        <Text style={styles.subTitle}>Tổng quan hệ thống</Text>
     
           <Text style={styles.mainText}>
             {totalItems} thay đổi về số lượng
           </Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#003366',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 5
  },

  subTitle: {
    color: '#B1C3B9',
    fontSize: 13,
    marginBottom: 8
  },

  mainText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 16
  },

})