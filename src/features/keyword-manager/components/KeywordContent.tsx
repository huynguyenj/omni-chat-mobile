import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView } from 'react-native'
import React, { useState } from 'react'
import OverviewCardKeyword from './OverviewCardKeyword'
import useGetListKeywords from '../hooks/useGetListKeywords'
import NoDataCard from '@/components/ui/cards/NodataCard'
import KeywordItem from './KeywordItems'
import usePagination from '@/hooks/usePagination'
import useDebounce from '@/hooks/useDebounce'
import Input from '@/components/ui/inputs/Input'
import { Funnel, ListFilterPlus, Search } from 'lucide-react-native'
import CreateSection from './CreateSection'
import OverviewKeywordCardSkeleton from './ui/skeleton/OverviewKeywordCardSkeleton'
import KeywordItemSkeleton from './ui/skeleton/KeywordItemSkeleton'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import useGetIntentType from '@/features/task/hooks/useGetIntentType'
import Button from '@/components/ui/buttons/Button'

export default function KeywordContent() {
  const { currentPage, setCurrentPage, setSearchText, keyWordList, loading, handleRefreshKeywordList, searchText, handleSortType, handleSortBy, sortBy, sortType, handleFilterByIntentTypeName, filterIntent } = useGetListKeywords()
  const { loadMore } = usePagination({ currentPage: currentPage, loading: loading, setPage: setCurrentPage, totalPage: keyWordList?.meta.total_pages ?? 1 })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const { intentType } = useGetIntentType()
  const handleSearch = (text: string) => {
      handleRefreshKeywordList()
      setSearchText(text)
    }
  const debounce = useDebounce(handleSearch, 500)
    
    const handleOpenFilter = () => {
        setIsFilterOpen(prevState => !prevState)
    }
    const handleSortOpen = () => {
        setIsSortOpen(prevState => !prevState)
    }
  return (
    <View style={styles.container}>
      { loading && !keyWordList ?
        <OverviewKeywordCardSkeleton/>
        :
        <OverviewCardKeyword totalKeywords={keyWordList?.meta.total_items ?? 0}/>
      }
        <View style={styles.searchContainer}>
            <Input onChangeText={debounce} icon={{ iconName: Search, iconDirection: 'left' }} placeholder='Tìm kiếm theo tên,...' style={styles.searchInput}/>
            <Button style={styles.btn} icon={{ iconName: ListFilterPlus, iconDirection: 'center' }} onPress={handleSortOpen}/>
            <Button style={styles.btn} icon={{ iconName: Funnel, iconDirection: 'center' }} onPress={handleOpenFilter}/>
      </View>
             {/*Sort modal */}
          <ModalCustom isOpen={isSortOpen} onClose={handleSortOpen}>
            <ScrollView>
                  <Text style={styles.filterText}>Kiểu sắp xếp</Text>
                  <View style={styles.filterSectionContainer}>
                              <Button variant={sortBy === 'createdate' ? 'secondary' : 'outline'} style={styles.filterBtn} content='Ngày tạo' onPress={() => handleSortBy('createdate')}/>
                              <Button variant={sortBy === 'intenttypename' ? 'secondary' : 'outline'} style={styles.filterBtn} content='Chức năng' onPress={() => handleSortBy('intenttypename')}/>
                  </View>
                  <View style={styles.filterSectionContainer}>
                        <Button  variant={sortType === true ? 'secondary' : 'outline'} style={styles.filterBtn} content={sortBy === 'createdate' ? 'Mới nhất' : 'Giảm dần'} onPress={() => handleSortType(true)}/>
                        <Button  variant={sortType === false ? 'secondary' : 'outline'} style={styles.filterBtn} content={sortBy === 'createdate' ? 'Cũ nhất' : 'Tăng dần'} onPress={() => handleSortType(false)}/>
                  </View>
            </ScrollView>
          </ModalCustom>
            {/*Filter modal */}
          <ModalCustom isOpen={isFilterOpen} onClose={handleOpenFilter}>
            <ScrollView>
                  <Text style={styles.filterText}>Chức năng</Text>
                  <View style={styles.filterSectionContainer}>
                        <Button variant={filterIntent === '' ? 'secondary' : 'outline'} style={styles.filterBtn} content='Tất cả' onPress={() => handleFilterByIntentTypeName('')}/>
                        { intentType?.map((intent, i) => (
                              <Button variant={filterIntent === intent.id ? 'secondary' : 'outline'} style={styles.filterBtn} key={i} content={intent.typeName} onPress={() => handleFilterByIntentTypeName(intent.id)}/>
                        )) }
                  </View>
            </ScrollView>
          </ModalCustom>
      <View style={styles.listContainer}>
        { loading && !keyWordList ?
            Array.from({ length: 3 }).map((_, i) => (
                      <KeywordItemSkeleton key={i}/>
                  ))
            :
            <>
            { keyWordList && keyWordList.items.length > 0 ?
                <FlatList
                   data={keyWordList.items}
                   renderItem={({ item }) => <KeywordItem data={item} onRefresh={handleRefreshKeywordList}/>}
                   onEndReached={loadMore}
                   onEndReachedThreshold={0.1}
                   refreshing={loading}
                   onRefresh={handleRefreshKeywordList}
                   ListFooterComponent={
                        currentPage < keyWordList.meta.total_pages ? (
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
            flex: 0.85,
      },
            filterText: {
            fontSize: 14,
            fontWeight: 600
      },
      searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
      },
      searchInput: {
            height: 50,
            width: 265
      },
      btn: {
            width: 50,
            height: 50,
            borderRadius: 10
      },
      filterSectionContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginVertical: 10
      },
      filterBtn: {
            alignSelf: 'flex-start',
            paddingHorizontal: 15,
            paddingVertical: 8
      }
})
