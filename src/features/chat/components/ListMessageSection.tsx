import { View, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import Input from '@/components/ui/inputs/Input'
import { Search } from 'lucide-react-native'
import useGetAwaitedMessage from '../hooks/useGetAwaitedMessage'
import NoDataCard from '@/components/ui/cards/NodataCard'
import { ChatItem } from './ChatItem'
import ChatItemSkeleton from './ui/skeleton/ChatItemSkeleton'


export default function ListMessageSection() {
  const { resolveMessageTab, handleRefresh, loading } = useGetAwaitedMessage()
  return (
    <View style={styles.container}>
      <Input
        icon={{
          iconName: Search,
          iconDirection: 'left'
        }}
        placeholder='Tìm kiếm tên khách hàng...'
      />
      { loading ?
          Array.from({ length: 4 }).map((_, i) => (
            <ChatItemSkeleton key={i}/>
        ))
        :
        <>
          { resolveMessageTab && resolveMessageTab.length > 0 ?
              <FlatList
                data={resolveMessageTab}
                keyExtractor={(item) => item.conversationId}
                renderItem={({ item }) => <ChatItem item={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
                onRefresh={handleRefresh}
                refreshing={loading}
              />
            :
            <NoDataCard title='Chưa có tin nhắn mới' description='Hiện tại bạn chưa có khách hàng nào được phân công'/>
            }
        </>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
     flex: 0.8,
     paddingHorizontal: 18,
     backgroundColor: '#F2F4F7'
  },
})