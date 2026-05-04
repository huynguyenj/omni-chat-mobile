import { View, Text, StyleSheet, FlatList } from 'react-native'
import React, { useRef } from 'react'
import useGetShipperOrder from '../hooks/useGetShipperOrder'
import usePagination from '@/hooks/usePagination'
import OrderShipperHeader from './OrderShipperHeader'
import OrderShipperItem from './OrderShipperItem'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

export default function ShipperMainContent() {
  const { loading, orderShipperList, setCurrentPage, currentPage, setOnRefresh } = useGetShipperOrder()
  const { loadMore, refresh, refreshing } = usePagination({ currentPage: currentPage, loading: loading, setPage: setCurrentPage, totalPage: orderShipperList?.meta.total_pages ?? 1 })
  return (
    <View style={styles.wrapper}>
            <OrderShipperHeader totalItems={orderShipperList?.meta.total_items}/>
            <View style={styles.listContainer}>
               { orderShipperList && 
                  <FlatList
                        data={orderShipperList.items}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                              <OrderShipperItem data={item} onRefresh={setOnRefresh}/>
                        )}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.1}
                        refreshing={refreshing}
                        onRefresh={refresh}
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
      }
})