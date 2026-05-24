import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React from 'react'
import useGetProductBatchAudit from '../hooks/useGetProductBatchAudit'
import usePagination from '@/hooks/usePagination'
import OverviewCardAuditSkeleton from './ui/skeleton/OverviewCardAuditSkeleton'
import OverviewCardAudit from './OverviewCardAudit'
import Button from '@/components/ui/buttons/Button'
import { LIST_FILTER_ACTION } from '../const/filter-action'
import { LIST_SORT_AUDIT_BY } from '../const/sort-by'
import { ArrowDownNarrowWide, ArrowDownWideNarrow } from 'lucide-react-native'
import ProductAuditItem from './ProductBatchAuditItem'
import ProductAuditItemSkeleton from './ui/skeleton/ProductAuditItemSkeleton'
import NoDataCard from '@/components/ui/cards/NodataCard'

export default function BatchAuditMainContent() {
  const { listBatchAudit, loading, isDescending, sortBy, filterAction, currentPage, setCurrentPage, handleFilterAction, handleRefresh, handleSortBy, handleSortDescending } = useGetProductBatchAudit()
  const { loadMore } = usePagination({ currentPage: currentPage, setPage: setCurrentPage, loading: loading, totalPage: listBatchAudit?.meta.total_pages ?? 0 })

  return (
    <View style={styles.container}>
      { loading && !listBatchAudit ?
        <OverviewCardAuditSkeleton/>
        :
        <OverviewCardAudit totalItems={listBatchAudit?.meta.total_items ?? 0}/>
      }
      <View>
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Hành động:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
                    onPress={() => handleFilterAction('')}
                    style={[styles.filterBtn, filterAction === '' && styles.filterBtnSelected]}
                 >
                    <Text style={[styles.filterBtnText, filterAction === '' && styles.filterBtnTextSelected]}>Tất cả</Text>
                </TouchableOpacity>
            { LIST_FILTER_ACTION.map((action, i) => (
                <TouchableOpacity
                    key={i}
                    onPress={() => handleFilterAction(action.value)}
                    style={[styles.filterBtn, action.value === filterAction && styles.filterBtnSelected]}
                 >
                    <Text style={[styles.filterBtnText, action.value === filterAction && styles.filterBtnTextSelected]}>{action.label}</Text>
                </TouchableOpacity>
            )) }
          </ScrollView>
        </View>
       <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Sắp xếp:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            { LIST_SORT_AUDIT_BY.map((sortType, i) => (
                <TouchableOpacity
                    key={i}
                    onPress={() => handleSortBy(sortType.value)}
                    style={[styles.filterBtn, sortType.value === sortBy && styles.filterBtnSelected]}
                 >
                    <Text style={[styles.filterBtnText, sortType.value === sortBy && styles.filterBtnTextSelected]}>{sortType.label}</Text>
                </TouchableOpacity>
            )) }
          </ScrollView>
          <Button style={styles.sortBtn} icon={{ iconName: isDescending ? ArrowDownWideNarrow: ArrowDownNarrowWide, iconDirection: 'center' }} onPress={handleSortDescending}/>
        </View>
      </View>
      <View style={styles.listContainer}>
        { loading && !listBatchAudit ?
           Array.from({ length: 2 }).map((_, i) => (
            <ProductAuditItemSkeleton key={i}/>
          )) 
          :
          <>
            { listBatchAudit && listBatchAudit.items.length > 0 ?
              <FlatList
                data={listBatchAudit?.items}
                renderItem={({ item }) => <ProductAuditItem item={item}/>}
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                onRefresh={handleRefresh}
                refreshing={loading}
                ListFooterComponent={
                    currentPage < listBatchAudit.meta.total_pages ? (
                          <View style={{ paddingVertical: 16 }}>
                                {loading ? <ActivityIndicator /> : null}
                          </View>
                    ) : null
                }
              />
            :
            <NoDataCard title='Không có sự thay đổi' description='Không có bất kỳ sự thay đổi nào về số lượng các các lô hàng'/>
            }
          </>
        }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 1,
            paddingHorizontal: 10,
            paddingVertical: 8
      },

      filterContainer: {
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
            marginVertical: 10
      },
      filterTitle: {
            textTransform: 'uppercase',
            fontWeight: 700,
            fontSize: 12
      },
      filterBtn: {
            marginHorizontal: 5,
            backgroundColor: '#E6E8EB',
            paddingVertical: 12,
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
      sortBtn: {
            width: 50,
            height: 50
      },
      listContainer: {
            flex: 0.9
      },
})