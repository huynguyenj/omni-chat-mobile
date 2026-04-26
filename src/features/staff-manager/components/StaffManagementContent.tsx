import { View, Text, StyleSheet, FlatList } from 'react-native'
import React, { useState } from 'react'
import useGetIntentType from '@/features/task/hooks/useGetIntentType'
import useGetListStaff from '../hooks/useGetListStaff'
import useUpdateStaffInfo from '../hooks/useUpdateStaffInfo'
import { IntentType } from '@/features/task/types/task-type'
import useDeleteStaff from '../hooks/useDeleteStaff'
import useDebounce from '@/hooks/useDebounce'
import { StaffDetailType } from '../types/staff-type'
import OverviewCardStaff from './OverviewCardStaff.'
import StaffItem from './StaffItem'
import usePagination from '@/hooks/usePagination'
import NoDataCard from '@/components/ui/cards/NodataCard'
import Input from '@/components/ui/inputs/Input'
import { Search } from 'lucide-react-native'

export default function StaffManagementContent() {
//   const [isOpenEdit, setIsOpenEdit] = useState(false)
//   const [isAlertOpen, setIsAlertOpen] = useState(false)
//   const { intentType } = useGetIntentType()
  const { currentPage, handleRefreshStaffList, listStaffs, loading, setCurrentPage, setSearchText, setSortBy, setSortType, sortBy, sortType } = useGetListStaff()
//   const {checkedIntentType, errors, handleSubmit, loading:loadingUpdate, onSubmit, control, reset, setCheckIntentType, setStaffInfoEdit, staffInfoEdit } = useUpdateStaffInfo({ onRefresh: handleRefreshStaffList })
//   const { handleDelete, loading: loadingDelete, setStaffId } = useDeleteStaff({ onRefresh: handleRefreshStaffList, onCloseModalUpdate: setIsAlertOpen })
  const { loadMore } = usePagination({ currentPage: currentPage, loading: loading, setPage: setCurrentPage, totalPage: listStaffs?.meta.total_pages ?? 1 })
  const handleSearch = (text: string) => {
    setSearchText(text)
  }
  const debounce = useDebounce(handleSearch, 500)

  return (
    <View style={styles.container}>
      <OverviewCardStaff totalStaff={listStaffs?.meta.total_items ?? 0}/>
      <Input onChangeText={debounce} icon={{ iconName: Search, iconDirection: 'left' }} placeholder='Tìm kiếm theo tên,...'/>
      <View style={styles.listContainer}>
         {listStaffs && listStaffs.items.length > 0 ?
            <FlatList
                  data={listStaffs.items}
                  renderItem={({ item }) => <StaffItem data={item} onRefresh={handleRefreshStaffList}/>}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.1}
                  refreshing={loading}
                  onRefresh={handleRefreshStaffList}
            />
            :
            <NoDataCard/>
          }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 0.9,
            paddingHorizontal: 10,
            paddingVertical: 8
      },
      listContainer: {
            flex: 0.9
      }
})

