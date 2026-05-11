import { View, Text, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import useGetChatTemplate from '../hooks/useGetChatTemplate'
import usePagination from '@/hooks/usePagination'
import OverviewChatTemplateCard from './OverviewChatTemplateCard'
import Input from '@/components/ui/inputs/Input'
import useDebounce from '@/hooks/useDebounce'
import { Search } from 'lucide-react-native'
import ChatTemplateItem from './ChatTemplateItem'
import ChatTemplateCreation from './ChatTemplateCreation'
import OverviewChatTemplateCardSkeleton from './ui/ChatTemplateOverviewSkeleton'
import ChatTemplateItemSkeleton from './ui/ChatTemplateItemSkeleton'
import NoDataCard from '@/components/ui/cards/NodataCard'

export default function ChatTemplateMainContent() {
  const { currentPage, handleRefresh, listChatTemplate, loading, setCurrentPage, setSearchText } = useGetChatTemplate()
  const { loadMore } = usePagination({ currentPage: currentPage, loading: loading, setPage: setCurrentPage, totalPage: listChatTemplate?.meta.total_pages ?? 0 })
  const handleSearch = (text: string) => {
        handleRefresh()
        setSearchText(text)
  }
  const debounce = useDebounce(handleSearch, 500)  
  return (
    <View style={styles.container}>
      { loading ?
            <OverviewChatTemplateCardSkeleton/>
      :
            <OverviewChatTemplateCard totalItems={listChatTemplate?.meta.total_items ?? 0}/>
      }
      <Input onChangeText={debounce} icon={{ iconName: Search, iconDirection: 'left' }} placeholder='Tìm kiếm theo tên, mã...'/>
      <View style={styles.listContainer}>
         { loading  ?
               Array.from({ length: 3 }).map((_, i) => (
                  <ChatTemplateItemSkeleton key={i}/>
            )) 
            :
            <>
            { listChatTemplate && listChatTemplate.items.length > 0 ?
                  <FlatList
                  data={listChatTemplate?.items}
                  renderItem={({ item }) => <ChatTemplateItem item={item} onRefresh={handleRefresh}/>}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.1}
                  onRefresh={handleRefresh}
                  refreshing={loading}
                  />
            :
                  <NoDataCard title='Không có dữ liệu' description='Dữ liệu từ khóa mẫu không có'/>
            }  
            </>
         }
      </View>
      <ChatTemplateCreation onRefresh={handleRefresh}/>
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 1,
            paddingHorizontal: 10,
            paddingVertical: 8
      },
      listContainer: {
            flex: 0.85
      },
})
