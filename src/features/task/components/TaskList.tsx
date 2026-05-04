import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native'
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
      return { ...prevVal, taskName: value }
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
                              onPress={() => handelTypeSelected('All')}
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
                              onPress={() => handelTimeSelected('All')}
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
      { listTasks && listTasks.items.length > 0
            ?
            <FlatList
               data={listTasks.items}
               keyExtractor={(item) => item.id}
               renderItem={({ item }: { item: TaskListType }) => {
                        return (
                              <Card style={styles.cardContainer}>
                                    <View style={styles.cardHeader}>
                                          {/* { iconStatus[item.status] } */}
                                          <Tag variant={TASK_STATUS[item.status].tagVariant}>
                                                <Text style={styles.tagText}>{TASK_STATUS[item.status].name}</Text>
                                          </Tag>
                                          <View style={styles.contentContainer}>
                                                      <Text style={styles.cardTitle}>{item.intentTypeName}</Text>
                                                      <View style={{ flexDirection: 'row', gap: 5, marginTop: 5 }}>
                                                            <CalendarDays size={18} color={'#5A5E65'}/>
                                                            <Text style={styles.dateText}>{formatDate(item.completedAt)}</Text>
                                                      </View>
                                          </View>
                                    </View>
                                          <Text style={styles.cardContent}>{item.customerName}</Text>
                                          <View style={styles.typeTag}>
                                                <Text style={styles.typeText}>{item.intentTypeName}</Text>
                                          </View>
                              </Card>
                        )
                  }}
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                refreshing={loading}
                onRefresh={handleRefreshTaskList}
                ListFooterComponent={ loading ? <LoadingCircle size={40}/> : null }
                
            />
      :
      <NoDataCard/>
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
      cardContainer: {
            gap: 10,
            marginTop: 12,
            overflow: 'hidden',
            backgroundColor: '#F2F4F7'
      },
      cardHeader: {
            flexDirection: 'row',
            gap: 5
      },
      tagText: {
            fontSize: 12,
            fontWeight: 600,
            color: '#ffffff'
      },
      cardTitle: {
            fontSize: 16,
            color: '#003366',
            fontWeight: 700
      },
      dateText: {
            fontSize: 13,
            color: '#5A5E65',
      },
      contentContainer: {
            width: '90%'
      },
      cardContent: {
            fontSize: 14,
            color: '#5A5E65',
            marginTop: 14,
            width: '80%'
      },
      typeTag: {
            position: 'absolute',
            right: -22,
            overflow: 'hidden',
            bottom: -16,
            borderRadius: 200,
            width: 120,
            height: 100,
            alignContent:'center',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#E0E7FF',
            transform: [{ rotate: '-45deg' }]
      },
      typeText: {
            width: '60%',
            textAlign:'center',
            color: '#3366CC',
            fontWeight: 700,
            fontSize: 12
      }
})