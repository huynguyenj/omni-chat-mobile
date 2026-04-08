import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import { ResolveMessageType } from '../types/message-type'
import { formatTime } from '@/utils/format'
import { truncateText } from '@/utils/text-resolver'
import Input from '@/components/ui/inputs/Input'
import { Search } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ChatStackParamList } from '@/navigation/role-navigator/StaffNavigator'
import useGetAwaitedMessage from '../hooks/useGetAwaitedMessage'


export const dummyMessages: ResolveMessageType[] = [
  {
    conversationId: 'conv-001',
    customerName: 'Nguyễn Văn A',
    avartarUrl: 'https://i.pravatar.cc/150?img=1',
    providerName: 'Support Team',
    lastMessage: 'Anh/chị cần hỗ trợ thêm gì không?',
    updateDate: '2026-04-07T14:20:00Z',
    unreadMessageCount: 2,
  },
  {
    conversationId: 'conv-002',
    customerName: 'Trần Thị B',
    avartarUrl: 'https://i.pravatar.cc/150?img=2',
    providerName: 'Sales Team',
    lastMessage: 'Sản phẩm này đang giảm giá 20%',
    updateDate: '2026-04-07T13:10:00Z',
    unreadMessageCount: 0,
  },
  {
    conversationId: 'conv-003',
    customerName: 'Lê Văn C',
    avartarUrl: 'https://i.pravatar.cc/150?img=3',
    providerName: 'Delivery',
    lastMessage: 'Đơn hàng của bạn đang được giao',
    updateDate: '2026-04-07T12:45:00Z',
    unreadMessageCount: 1,
  },
  {
    conversationId: 'conv-004',
    customerName: 'Phạm Thị D',
    avartarUrl: 'https://i.pravatar.cc/150?img=4',
    providerName: 'Support Team',
    lastMessage: 'Chúng tôi đã xử lý yêu cầu của bạn',
    updateDate: '2026-04-06T18:30:00Z',
    unreadMessageCount: 0,
  },
  {
    conversationId: 'conv-005',
    customerName: 'Hoàng Văn E',
    avartarUrl: 'https://i.pravatar.cc/150?img=5',
    providerName: 'Billing',
    lastMessage: 'Hóa đơn của bạn đã được thanh toán',
    updateDate: '2026-04-06T16:15:00Z',
    unreadMessageCount: 3,
  },
  {
    conversationId: 'conv-006',
    customerName: 'Đặng Thị F',
    avartarUrl: 'https://i.pravatar.cc/150?img=6',
    providerName: 'Support Team',
    lastMessage: 'Vui lòng kiểm tra lại thông tin giúp mình',
    updateDate: '2026-04-06T10:05:00Z',
    unreadMessageCount: 0,
  },
  {
    conversationId: 'conv-007',
    customerName: 'Bùi Văn G',
    avartarUrl: 'https://i.pravatar.cc/150?img=7',
    providerName: 'Technical Team',
    lastMessage: 'Chúng tôi đang kiểm tra lỗi hệ thống',
    updateDate: '2026-04-05T21:40:00Z',
    unreadMessageCount: 5,
  },
  {
    conversationId: 'conv-008',
    customerName: 'Võ Thị H',
    avartarUrl: 'https://i.pravatar.cc/150?img=8',
    providerName: 'Customer Care',
    lastMessage: 'Cảm ơn bạn đã phản hồi!',
    updateDate: '2026-04-05T19:25:00Z',
    unreadMessageCount: 0,
  },
]

type NavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  'ChatScreen'
>

export function ChatItem({ item }: { item: ResolveMessageType }) {
  const navigation = useNavigation<NavigationProp>()
  const handleNavigate = () => {
    navigation.navigate('ChatDetail', { id: item.conversationId })
  }
  return (
    <TouchableOpacity 
        style={styles.chatItemContainer} 
        activeOpacity={0.7}
        onPress={() => handleNavigate()}
      >
      
      <Image 
        source={item.avartarUrl? { uri: item.avartarUrl } : require('@assets/avatar-sample.jpg')} 
        style={styles.avatar} 
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{item.customerName}</Text>
          <Text style={styles.time}>{formatTime(item.updateDate)}</Text>
        </View>

        {/* <Text style={styles.provider}>{item.providerName}</Text> */}

        <View style={styles.footer}>
          <Text
            style={[
              styles.message,
              item.unreadMessageCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {truncateText(item.lastMessage, 30)}
          </Text>

          {item.unreadMessageCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.unreadMessageCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function ListMessageSection() {
  const { resolveMessageTab } = useGetAwaitedMessage()
  return (
    <View style={styles.container}>
      <Input
        icon={{
          iconName: Search,
          iconDirection: 'left'
        }}
        placeholder='Tìm kiếm tên khách hàng...'
      />
      <FlatList
        data={resolveMessageTab}
        keyExtractor={(item) => item.conversationId}
        renderItem={({ item }) => <ChatItem item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
     flex: 0.8,
     paddingHorizontal: 18,
     backgroundColor: '#F2F4F7'
  },
  searchInput: {

  },
  chatItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 18,
    borderRadius: 18,
    marginBottom: 10,
    alignItems: 'center',
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: '100%',
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003366',
  },

  time: {
    fontSize: 11,
    color: '#8A96A8',
  },

  provider: {
    fontSize: 12,
    color: '#5A5E65',
    marginTop: 2,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  message: {
    flex: 1,
    fontSize: 12,
    color: '#8A96A8',
  },

  unreadMessage: {
    fontWeight: '600',
    color: '#000',
  },

  badge: {
    backgroundColor: '#003366',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
})