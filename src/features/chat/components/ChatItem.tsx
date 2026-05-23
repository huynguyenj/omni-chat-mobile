import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native'
import React, { useState } from 'react'
import { ResolveMessageType } from '../types/message-type'
import { formatTime } from '@/utils/format'
import { truncateText } from '@/utils/text-resolver'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ChatStackParamList } from '@/navigation/role-navigator/StaffNavigator'
import useCompleteConversation from '../hooks/useCompleteConveration'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import Button from '@/components/ui/buttons/Button'

type NavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  'ChatScreen'
>

export function ChatItem({ item }: { item: ResolveMessageType }) {
  const navigation = useNavigation<NavigationProp>()
  const { handleCompleteConversation, loading } = useCompleteConversation()
  const [alert, setAlert] = useState(false)
  const handleOpenAlert = () => {
    setAlert(prevState => !prevState)
  }
  const handleNavigate = () => {
    navigation.navigate('ChatDetail', { id: item.conversationId })
  }
  return (
    <TouchableOpacity 
        style={styles.chatItemContainer} 
        activeOpacity={0.7}
        onPress={() => handleNavigate()}
        delayLongPress={300}
        onLongPress={handleOpenAlert}
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
      <ModalCustom isOpen={alert} onClose={handleOpenAlert}>
          <Text style={styles.modalTitle}>Bạn có chắc hoàn thành cuộc trò chuyện với khách hàng {item.customerName}</Text>
          <View style={styles.modalBtnContainer}>
            <Button variant='outline' style={styles.modalBtn} content='Không' onPress={handleOpenAlert}/>
            <Button style={styles.modalBtn} content='Có' onPress={() => handleCompleteConversation(item.conversationId)}/>
          </View>
      </ModalCustom>
    </TouchableOpacity>
  )
}


const styles = StyleSheet.create({

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
    borderRadius: 150,
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
  modalBtnContainer: {
    flexDirection: 'row',
    gap: 5,
    marginVertical: 10,
    justifyContent: 'center'
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 500
  },
  modalBtn: {
    width: 160,
  }
})