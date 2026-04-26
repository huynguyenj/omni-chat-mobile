import { View, Text, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import OverviewCardKeyword from './OverviewCardKeyword'
import useGetListKeywords from '../hooks/useGetListKeywords'
import NoDataCard from '@/components/ui/cards/NodataCard'
import KeywordItem from './KeywordItems'
import usePagination from '@/hooks/usePagination'
import useDebounce from '@/hooks/useDebounce'
import Input from '@/components/ui/inputs/Input'
import { Search } from 'lucide-react-native'
import CreateSection from './CreateSection'

export default function KeywordContent() {
  const { currentPage, setCurrentPage, setSearchText, keyWordList, loading, handleRefreshKeywordList, searchText } = useGetListKeywords()
  const { loadMore } = usePagination({ currentPage: currentPage, loading: loading, setPage: setCurrentPage, totalPage: keyWordList?.meta.total_pages ?? 1 })
  
  const handleSearch = (text: string) => {
      setSearchText(text)
    }
  const debounce = useDebounce(handleSearch, 500)
  
  return (
    <View style={styles.container}>
      <OverviewCardKeyword totalKeywords={keyWordList?.meta.total_items ?? 0}/>
      <Input onChangeText={debounce} icon={{ iconName: Search, iconDirection: 'left' }} placeholder='Tìm kiếm theo tên,...'/>
      <View style={styles.listContainer}>
        { keyWordList && keyWordList.items.length > 0 ?
            <FlatList
               data={keyWordList.items}
               renderItem={({ item }) => <KeywordItem data={item} onRefresh={handleRefreshKeywordList}/>}
               onEndReached={loadMore}
               onEndReachedThreshold={0.1}
               refreshing={loading}
               onRefresh={handleRefreshKeywordList}
            />
            :
            <NoDataCard/>
        } 
      </View>
      <CreateSection onRefresh={handleRefreshKeywordList}/>
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
            flex: 0.75,
      },
})
