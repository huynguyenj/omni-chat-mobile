import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import Input from '@/components/ui/inputs/Input'
import { CalendarDays, CircleCheck, Loader, LucideIcon, Search, TriangleAlert } from 'lucide-react-native'
import Card from '@/components/ui/cards/Card'
import useGetIntentType from '../hooks/useGetIntentType'
import useGetClaimList from '@/features/claim/hooks/useGetClaimList'
import usePagination from '@/hooks/usePagination'
import { TaskListType, TaskType } from '../types/task-type'
import { formatDate } from '@/utils/format'
import useGetListTasks from '../hooks/useGetListTask'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'
import Tag from '@/components/ui/tags/Tag'
import { TASK_STATUS } from '../const/task-status'
import useDebounce from '@/hooks/useDebounce'
import NoDataCard from '@/components/ui/cards/NodataCard'
import TaskHistoryItem from './TaskHistoryItem'
import TaskHistoryItemSkeleton from './ui/skeleton/TaskHistoryItemSkeleton'

type TimeType = {
   value: string
   time: string
}

const timeList: TimeType[] = [
      { time: '7 ngày', value: '7days' },
      { time: '30 ngày', value: '30days' },
      { time: '90 ngày', value: '90days'}
]


export default function TaskList() {
  const [typeSelected, setTypeSelected] = useState('')
  const [timeSelected, setTimeSelected] = useState('')
  const { handleFilterByDate, handleFilterByType, handleRefreshTaskList, listTasks, loading, setFilter, currentPage, setCurrentPage } = useGetListTasks()
  const { loadMore } = usePagination({ currentPage: currentPage, loading: loading, setPage: setCurrentPage, totalPage: listTasks?.meta.total_pages ?? 1 })
  const { intentType } = useGetIntentType()
  const handelTypeSelected = (value: string) => {
      setTypeSelected(value)
      handleFilterByType(value)
  }
  const handelTimeSelected = (value: string) => {
      setTimeSelected(value)
      handleFilterByDate(value)
  }

    const handleSearch = (value: string) => {
    setFilter((prevVal) => {
      return { ...prevVal, taskName: value, page: 1 }
    })
  }

  const debouncedSearch = useDebounce(handleSearch, 500)

  return (
    <View style={styles.container}>
      <Input
            icon={{
                  iconName: Search,
                  iconDirection: 'left'
            }} 
            onChangeText={debouncedSearch}
            placeholder='Tìm kiếm task với tên...' 
            style={{ height: 55 }}
      />
      <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Loại:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                              onPress={() => handelTypeSelected('')}
                              style={[styles.filterBtn, !typeSelected && styles.filterBtnSelected]}
                        >
                              <Text style={[styles.filterBtnText, !typeSelected && styles.filterBtnTextSelected]}>Tất cả</Text>
                        </TouchableOpacity>
                  {intentType?.map((t) => (
                        <TouchableOpacity
                              key={t.id}
                              onPress={() => handelTypeSelected(t.id)}
                              style={[styles.filterBtn, t.id === typeSelected && styles.filterBtnSelected]}
                        >
                              <Text style={[styles.filterBtnText, t.id === typeSelected && styles.filterBtnTextSelected]}>{t.typeName}</Text>
                        </TouchableOpacity>
                  ))}
            </ScrollView>
      </View>
       <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Thời gian:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                              onPress={() => handelTimeSelected('')}
                              style={[styles.filterBtn, !timeSelected  && styles.filterBtnSelected]}
                        >
                              <Text style={[styles.filterBtnText, !timeSelected && styles.filterBtnTextSelected]}>Tất cả</Text>
                        </TouchableOpacity>
                  {timeList.map((t) => (
                        <TouchableOpacity
                              key={t.time}
                              onPress={() => handelTimeSelected(t.value)}
                              style={[styles.filterBtn, t.value === timeSelected && styles.filterBtnSelected]}
                        >
                              <Text style={[styles.filterBtnText, t.value === timeSelected && styles.filterBtnTextSelected]}>{t.time}</Text>
                        </TouchableOpacity>
                  ))}
            </ScrollView>
      </View>
      { loading && !listTasks ?
            Array.from({ length: 3 }).map((_, i) => (
            <TaskHistoryItemSkeleton key={i}/>
      )) 
      :
      <>
            { listTasks && listTasks.items.length > 0
            ?
            <FlatList
                  data={listTasks.items}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <TaskHistoryItem item={item}/>}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.1}
                  refreshing={loading}
                  onRefresh={handleRefreshTaskList}
                  ListFooterComponent={
                        currentPage < listTasks.meta.total_pages ? (
                              <View style={{ paddingVertical: 16 }}>
                                    {loading ? <ActivityIndicator /> : null}
                              </View>
                        ) : null
                  }
                  
            />
            :
                  <NoDataCard/>
      }
      </>
      }
    </View>
  )
}
const styles = StyleSheet.create({
      container: {
            flex: 0.85,
            marginTop: 14
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
})