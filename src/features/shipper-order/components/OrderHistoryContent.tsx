import { View, Text, StyleSheet, FlatList } from 'react-native'
import React, { useState } from 'react'
import OrderHistoryHeader from './OrderHistoryHeader'
import InputDate from '@/components/ui/inputs/InputDate'
import Card from '@/components/ui/cards/Card'
import usePagination from '@/hooks/usePagination'
import useGetOrderHistory from '../hooks/useGetOrderHistory'
import OrderHistoryItem from './OrderHistoryItem'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

export default function OrderHistoryContent() {
   const { currentPage, loading, orderHistory, setCurrentPage, setStartDate, setToDate, startDate, toDate, handleRefreshOrderHistory } = useGetOrderHistory()
    const { loadMore } = usePagination({ currentPage: currentPage, loading: loading, setPage: setCurrentPage, totalPage: orderHistory?.orders.meta.total_pages ?? 1 })
    
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
      <Card>
            <Text style={styles.cardTitle}>Tổng số đơn hàng đã giao</Text>
            <Text style={styles.cardNumber}>{orderHistory?.totalDeliveredOrders}</Text>
      </Card>
      <View style={styles.listContainer}>
                     { orderHistory && 
                        <FlatList
                              data={orderHistory.orders.items}
                              keyExtractor={(item) => item.id}
                              renderItem={({ item }) => (
                                    <OrderHistoryItem data={item}/>
                              )}
                              onEndReached={loadMore}
                              onEndReachedThreshold={0.1}
                              refreshing={loading}
                              onRefresh={handleRefreshOrderHistory}
                              ListFooterComponent={ loading ? <LoadingCircle size={40}/> : null }
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
      cardTitle: {
            fontSize: 14,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#8D9096'
      },
      cardNumber: {
            fontSize: 18,
            fontWeight: 700
      },
      
})