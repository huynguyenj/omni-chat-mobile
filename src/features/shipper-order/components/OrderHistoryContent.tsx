import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import OrderHistoryHeader from './OrderHistoryHeader'
import InputDate from '@/components/ui/inputs/InputDate'
import Card from '@/components/ui/cards/Card'
import usePagination from '@/hooks/usePagination'
import useGetOrderHistory from '../hooks/useGetOrderHistory'
import OrderHistoryItem from './OrderHistoryItem'
import Button from '@/components/ui/buttons/Button'
import { History } from 'lucide-react-native'
import NoDataCard from '@/components/ui/cards/NodataCard'

export default function OrderHistoryContent() {
   const { currentPage, loading, orderHistory, setCurrentPage, setStartDate, setToDate, startDate, toDate, handleRefreshOrderHistory } = useGetOrderHistory()
    const { loadMore } = usePagination({ currentPage: currentPage, loading: loading, setPage: setCurrentPage, totalPage: orderHistory?.orders.meta.total_pages ?? 1 })
  if (!orderHistory) return <NoDataCard/>
  return (
    <View style={styles.wrapper}>
      <OrderHistoryHeader/>
      <View style={styles.inputContainer}>
                  <InputDate
                  label='Ngày bắt đầu'
                  value={startDate}
                  onChange={setStartDate}
                  />
                  <InputDate
                  label='Ngày kết thúc'
                  value={toDate}
                  onChange={setToDate}
                  />
      </View>
      <Card style={styles.cardContainer}>
            <View>
                  <Text style={styles.cardTitle}>Tổng số đơn hàng đã giao</Text>
                  <Text style={styles.cardNumber}>{orderHistory.totalDeliveredOrders < 10 ? String(orderHistory.totalDeliveredOrders).padStart(2, '0') : orderHistory.totalDeliveredOrders}</Text>
            </View>
            <Button style={styles.refreshBtn} icon={{ iconName: History, iconDirection: 'center' }} onPress={handleRefreshOrderHistory}/>
      </Card>
      <View style={styles.listContainer}>
                     { orderHistory && 
                        <FlatList
                              showsVerticalScrollIndicator={false}
                              data={orderHistory.orders.items}
                              keyExtractor={(item) => item.id}
                              renderItem={({ item }) => (
                                    <OrderHistoryItem data={item}/>
                              )}
                              onEndReached={loadMore}
                              onEndReachedThreshold={0.1}
                              refreshing={loading}
                              onRefresh={handleRefreshOrderHistory}
                              ListFooterComponent={
                                    currentPage < orderHistory.orders.meta.total_pages ? (
                                          <View style={{ paddingVertical: 16 }}>
                                                {loading ? <ActivityIndicator /> : null}
                                          </View>
                                    ) : null
                              }
                        />
                     }
                  </View>
    </View>
  )
}

const styles = StyleSheet.create({
      wrapper: {
            flex:1
      },
      listContainer: {
            flex: 0.7,
      },
      inputContainer: {
            flexDirection: 'row',
            gap: 10,
            alignItems:'center',
      },
      cardContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
      },
      cardTitle: {
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#8D9096'
      },
      cardNumber: {
            fontSize: 18,
            fontWeight: 700
      },
      refreshBtn: {
            width: 40,
            aspectRatio: 1,
            borderRadius: 100,
            marginTop: 12
      }
})