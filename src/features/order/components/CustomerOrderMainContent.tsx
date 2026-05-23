import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React from 'react'
import Card from '@/components/ui/cards/Card'
import { FILTER_LIST } from '../const/order-status'
import useGetOrderCustomer from '../hooks/useGetCustomerOrder'
import { ArrowDownNarrowWide, ArrowDownWideNarrow } from 'lucide-react-native'
import CustomerOrderItem from './CustomerOrderItem'
import usePagination from '@/hooks/usePagination'
import NoDataCard from '@/components/ui/cards/NodataCard'
import CustomerOrderMainContentSkeleton from './ui/skeleton/CustomerOrderSkeleton'

type CustomerOrderMainContentProps = {
    customerId: string
}

export default function CustomerOrderMainContent({ customerId }: CustomerOrderMainContentProps) {
  const { handleFilterByStatus, handleRefresh, handleSort, setCurrentPage, listOrders, loading, status, newest, currentPage } = useGetOrderCustomer({ customerId })
  const { loadMore } = usePagination({ currentPage: currentPage, setPage: setCurrentPage, loading: loading, totalPage: listOrders?.meta.total_pages ?? 1 })  
  return (
    <View style={styles.container}>
      { loading && !listOrders ?
            <CustomerOrderMainContentSkeleton/>
            :
            <>
                  { listOrders ?
                  <>
                        <Card variant='primary'>
                                          <Text style={styles.cardTitle}>Tổng số đơn</Text>
                                          <View style={styles.cardMainTextContainer}>
                                                <Text style={styles.cardMainText}>{listOrders?.meta.total_items < 10 ? String(listOrders?.meta.total_items).padStart(2, '0') : listOrders?.meta.total_items}</Text>
                                                <Text style={styles.cardSubText}>đơn đã được đặt</Text>
                                          </View>
                        </Card>
                        <View style={styles.filterContainer}>
                              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                      <TouchableOpacity
                                                            onPress={() => handleFilterByStatus('')}
                                                            style={[styles.filterBtn, !status && styles.filterBtnSelected]}
                                                      >
                                                            <Text style={[styles.filterBtnText, !status && styles.filterBtnTextSelected]}>Tất cả</Text>
                                                      </TouchableOpacity>
                                                {FILTER_LIST.map((t) => (
                                                      <TouchableOpacity
                                                            key={t.value}
                                                            onPress={() => handleFilterByStatus(t.value)}
                                                            style={[styles.filterBtn, t.value === status && styles.filterBtnSelected]}
                                                      >
                                                            <Text style={[styles.filterBtnText, t.value === status && styles.filterBtnTextSelected]}>{t.label}</Text>
                                                      </TouchableOpacity>
                                                ))}
                              </ScrollView>
                              <TouchableOpacity style={styles.sortBtn} onPress={handleSort}>
                                    {newest ? <ArrowDownWideNarrow size={22} color={'#ffffff'}/> : <ArrowDownNarrowWide size={22} color={'#ffffff'}/>}
                              </TouchableOpacity>
                        </View> 
                        <View style={styles.listContainer}>
                        { listOrders.items.length > 0 ?
                              <FlatList
                                    showsVerticalScrollIndicator={false}
                                    data={listOrders?.items}
                                    renderItem={({ item }) => <CustomerOrderItem item={item}/>}
                                    onEndReached={loadMore}
                                    onEndReachedThreshold={0.1}
                                    onRefresh={handleRefresh}
                                    refreshing={loading}
                                    ListFooterComponent={
                                          currentPage < listOrders.meta.total_pages ? (
                                                <View style={{ paddingVertical: 16 }}>
                                                      {loading ? <ActivityIndicator /> : null}
                                                </View>
                                          ) : null
                  }
                              />
                              :
                              <NoDataCard description='Không có đơn đặt nào phù hợp'/>
                        }
                        </View>
                  </>
                  :
                  <NoDataCard title='Không có đơn đặt' description='Khách hàng này chưa đặt đơn nào cả'/>
                  }
            </>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    gap: 12,
  },
  cardTitle: {
      fontSize: 13,
      color: '#4A74AB',
      fontWeight: 600,
   },
   cardMainText: {
      color: '#ffffff',
      fontWeight: 700,
      fontSize: 22
   },
   cardMainTextContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
      marginVertical: 5
   },
   cardSubText: {
      fontSize: 11,
      color: '#4A74AB'
   },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  filterTitle: {
    textTransform: 'uppercase',
    fontWeight: 700,
    fontSize: 12,
    color: '#888C94'
  },
  filterBtn: {
    marginHorizontal: 5,
    backgroundColor: '#E6E8EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16
  },
  filterBtnSelected: {
    backgroundColor: '#183352'
  },
  filterBtnText: {
    fontWeight: 600,
    fontSize: 13
  },
  filterBtnTextSelected: {
    color: '#ffffff'
  },
  sortContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   gap: 10,
   marginVertical: 5,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#003366',
    width: 40,
    aspectRatio: 1,
    borderRadius: 10
  },
  listContainer: {
    maxHeight: 540,
  }
})