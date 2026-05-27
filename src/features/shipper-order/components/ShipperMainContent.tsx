import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import React, { useRef } from 'react'
import useGetShipperOrder from '../hooks/useGetShipperOrder'
import usePagination from '@/hooks/usePagination'
import OrderShipperHeader from './OrderShipperHeader'
import OrderShipperItem from './OrderShipperItem'

export default function ShipperMainContent() {
  const { loading, orderShipperList, setCurrentPage, currentPage, setOnRefresh, handleRefresh } = useGetShipperOrder()
  const { loadMore } = usePagination({ currentPage: currentPage, loading: loading, setPage: setCurrentPage, totalPage: orderShipperList?.meta.total_pages ?? 1 })
  return (
    <View style={styles.wrapper}>
            <OrderShipperHeader totalItems={orderShipperList?.meta.total_items} onRefresh={handleRefresh}/>
            <View style={styles.listContainer}>
               { orderShipperList && 
                  <FlatList
                        data={orderShipperList.items}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                              <OrderShipperItem data={item} onRefresh={handleRefresh}/>
                        )}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.1}
                        refreshing={loading}
                        onRefresh={handleRefresh}
                        ListFooterComponent={
                              currentPage < orderShipperList.meta.total_pages ? (
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
      }
})