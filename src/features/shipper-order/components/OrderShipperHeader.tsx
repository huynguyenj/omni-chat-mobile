import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Button from '@/components/ui/buttons/Button'
import { RotateCcw } from 'lucide-react-native'

type OrderShipperHeaderProps = {
   totalItems?: number
   onRefresh: () => void
}

export default function OrderShipperHeader({ totalItems, onRefresh }: OrderShipperHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
            <View style={styles.activeDot}></View>
            <Text style={styles.statusText}>Trạng thái: đang hoạt động</Text>
      </View>
      <View style={styles.mainTitleContainer}>
            <Text style={styles.mainTitle}>Đơn hàng cần giao</Text>
            <Button
                  icon={{ iconName: RotateCcw, iconDirection: 'center' }}
                  onPress={onRefresh}
                  style={styles.refreshBtn}
            />
      </View>
      <Text style={styles.subText}>Bạn có {totalItems ?? 0} đang chờ bạn giao</Text>
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 0.1,
            paddingVertical: 10
      },
      statusContainer: {
            flexDirection: 'row',
            gap: 5,
            alignItems: 'center'
      },
      activeDot: {
            width: 12,
            aspectRatio: 1,
            borderRadius: 150,
            backgroundColor:'#00B35D',
            shadowColor: '#4ee2a4',
            elevation: 7,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 5
      },
      statusText: {
            fontWeight: 600,
            textTransform: 'uppercase',
            color:'#8D9096',
            fontSize: 14
      },
      mainTitleContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between'
      },
      mainTitle: {
            fontWeight: 700,
            fontSize: 22,
            color: '#003366'
      },
      refreshBtn: {
            width: 40,
            aspectRatio: 1,
            borderRadius: 100
      },
      subText: {
            fontSize: 12,
            color: '#8D9096',
            fontWeight: 500
      }
})