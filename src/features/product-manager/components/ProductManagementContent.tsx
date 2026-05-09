import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native'
import React, { useState } from 'react'
import useGetProductListManager from '../hooks/useGetProductListManager'
import usePagination from '@/hooks/usePagination'
import useDebounce from '@/hooks/useDebounce'
import OverviewProductManagementCard from './OverviewProductManagementCard'
import Input from '@/components/ui/inputs/Input'
import { Funnel, ListFilterPlus, Search } from 'lucide-react-native'
import Button from '@/components/ui/buttons/Button'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import { LIST_PRODUCT_CAPACITY, LIST_PRODUCT_KIND_FILTER, LIST_PRODUCT_PACKAGE_TYPE, PRODUCT_LIST_SORT_BY } from '../const/filter-sort-list'
import useGetAllBrand from '@/features/order/hooks/useGetAllBrand'
import ProductManagementItem from './ProductManagementItem'
import ProductCreation from './ProductCreation'
import { OverviewProductManagementCardSkeleton } from './ui/skeleton/OverviewProductCardSkeleton'
import { ProductManagementItemSkeleton } from './ui/skeleton/ProductManagementItemSkeleton'

export default function ProductManagementContent() {
  const { currentPage, listProducts, loading, sortBy, sortType, filterBrand, filterCapacity, filterPackageType, filterProductKind, handleRefresh, setCurrentPage, setSearchText, handleFilterByBrand, handleFilterByCapacity, handleFilterByPackageType, handleFilterByProductKind, handleSortBy, handleSortType } = useGetProductListManager()
  const { loadMore } = usePagination({ currentPage: currentPage, loading: loading, setPage: setCurrentPage, totalPage: listProducts?.meta.total_pages ?? 1 })
  const { listBrand } = useGetAllBrand()
  const handleSearch = (text: string) => {
      setCurrentPage(1)
      setSearchText(text)
  }
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const handleOpenFilter = () => {
      setIsFilterOpen(prevState => !prevState)
  }
  const handleSortOpen = () => {
      setIsSortOpen(prevState => !prevState)
  }
  const debounce = useDebounce(handleSearch, 500)
  return (
    <View style={styles.container}>
     { loading ?
        <OverviewProductManagementCardSkeleton/>
        :
        <OverviewProductManagementCard totalItems={listProducts?.items.length ?? 0}/>
      }
      <View style={styles.searchContainer}>
            <Input style={styles.searchInput} onChangeText={debounce} icon={{ iconName: Search, iconDirection: 'left' }} placeholder='Tìm kiếm theo tên,...'/>
            <Button style={styles.btn} icon={{ iconName: ListFilterPlus, iconDirection: 'center' }} onPress={handleSortOpen}/>
            <Button style={styles.btn} icon={{ iconName: Funnel, iconDirection: 'center' }} onPress={handleOpenFilter}/>
      </View>
       {/*Sort modal */}
    <ModalCustom isOpen={isSortOpen} onClose={handleSortOpen}>
      <ScrollView>
            <Text style={styles.filterText}>Kiểu sắp xếp</Text>
            <View style={styles.filterSectionContainer}>
                  { PRODUCT_LIST_SORT_BY.map((sort, i) => (
                        <Button variant={sortBy === sort.value ? 'secondary' : 'outline'} style={styles.filterBtn} key={i} content={sort.label} onPress={() => handleSortBy(sort.value)}/>
                  )) }
            </View>
            <View style={styles.filterSectionContainer}>
                  <Button  variant={sortType === false ? 'secondary' : 'outline'} style={styles.filterBtn} content='Tăng dần' onPress={() => handleSortType(false)}/>
                  <Button  variant={sortType === true ? 'secondary' : 'outline'} style={styles.filterBtn} content='Giảm dần' onPress={() => handleSortType(true)}/>
            </View>
      </ScrollView>
    </ModalCustom>
      {/*Filter modal */}
    <ModalCustom isOpen={isFilterOpen} onClose={handleOpenFilter}>
      <ScrollView>
            <Text style={styles.filterText}>Kiểu hộp</Text>
            <View style={styles.filterSectionContainer}>
                  <Button variant={filterPackageType === '' ? 'secondary' : 'outline'} style={styles.filterBtn} content='Tất cả' onPress={() => handleFilterByPackageType('')}/>
                  { LIST_PRODUCT_PACKAGE_TYPE.map((packageType, i) => (
                        <Button variant={filterPackageType === packageType.value ? 'secondary' : 'outline'} style={styles.filterBtn} key={i} content={packageType.label} onPress={() => handleFilterByPackageType(packageType.value)}/>
                  )) }
            </View>
            <Text style={styles.filterText}>Dung tích</Text>
            <View style={styles.filterSectionContainer}>
                  <Button variant={filterCapacity === '' ? 'secondary' : 'outline'} style={styles.filterBtn} content='Tất cả' onPress={() => handleFilterByCapacity('')}/>
                  { LIST_PRODUCT_CAPACITY.map((capacity, i) => (
                        <Button variant={filterCapacity === capacity.value ? 'secondary' : 'outline'} style={styles.filterBtn} key={i} content={capacity.label} onPress={() => handleFilterByCapacity(capacity.value)}/>
                  )) }
            </View>
            <Text style={styles.filterText}>Loại sữa</Text>
            <View style={styles.filterSectionContainer}>
                  <Button variant={filterProductKind=== '' ? 'secondary' : 'outline'} style={styles.filterBtn} content='Tất cả' onPress={() => handleFilterByProductKind('')}/>
                  { LIST_PRODUCT_KIND_FILTER.map((kind, i) => (
                        <Button variant={filterProductKind === kind.value ? 'secondary' : 'outline'} style={styles.filterBtn} key={i} content={kind.label} onPress={() => handleFilterByProductKind(kind.value)}/>
                  )) }
            </View>
            <Text style={styles.filterText}>Hãng sữa</Text>
            <View style={styles.filterSectionContainer}>
                  <Button variant={filterBrand === '' ? 'secondary' : 'outline'} style={styles.filterBtn} content='Tất cả' onPress={() => handleFilterByBrand('')}/>
                  { listBrand.map((brand, i) => (
                        <Button variant={filterBrand === brand.id ? 'primary' : 'outline'} style={styles.filterBtn} key={i} content={brand.name} onPress={() => handleFilterByBrand(brand.id)}/>
                  )) }
            </View>
      </ScrollView>
    </ModalCustom>
    { loading ?
      <ProductManagementItemSkeleton/>
      :
      <>
            <View style={styles.listContainer}>
            <FlatList
                  data={listProducts?.items}
                  renderItem={({ item }) => <ProductManagementItem item={item} onRefresh={handleRefresh}/>}
                  onEndReached={loadMore}
                  onRefresh={handleRefresh}
                  refreshing={loading}
                  onEndReachedThreshold={0.1}
            />
            </View>
            <ProductCreation onRefresh={handleRefresh}/>
      </>
    }
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
      filterText: {
            fontSize: 14,
            fontWeight: 600
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
