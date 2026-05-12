import { View, Text, StyleSheet, Image } from 'react-native'
import React, { useState } from 'react'
import Button from '@/components/ui/buttons/Button'
import { Info, ListTodo, UserRoundSearch } from 'lucide-react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ChatStackParamList } from '@/navigation/role-navigator/StaffNavigator'
import { useNavigation } from '@react-navigation/native'
import { History } from 'lucide-react-native/icons'

type ChatDetailHeaderProps = {
  conversationId: string
  activeCustomerId: string
  customerName: string
  customerImageUrl: string | undefined
}

type NavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  'CustomerInfoScreen' 
  | 'ConversationTaskScreen'
  | 'TicketScreen'
  | 'CustomerOrderScreen'
>

export default function ChatDetailHeader({ conversationId, activeCustomerId, customerImageUrl, customerName }: ChatDetailHeaderProps) {
    const navigation = useNavigation<NavigationProp>()
    const [isSettingOpen, setIsSettingOpen] = useState(false)
    const handleNavigateCustomerInfoScreen= () => {
      navigation.navigate('CustomerInfoScreen', { conversationId: conversationId  })
    }
    const handleNavigateConversationTasks = () => {
      navigation.navigate('ConversationTaskScreen', { conversationId: conversationId })
    }
    const handleNavigateTicketScreen = () => {
      navigation.navigate('TicketScreen', { customerId: activeCustomerId })
    }
    const handleNavigateCustomerOrderScreen = () => {
      navigation.navigate('CustomerOrderScreen', { customerId: activeCustomerId })
    }
    const handleOpenSetting = () => {
      setIsSettingOpen(prevState => !prevState)
    }
  return (
    <>
      <View style={styles.container}>
        <View style={styles.nameContainer}>
          <Image style={styles.avatarImage} source={customerImageUrl ? { uri: customerImageUrl } : require('@assets/avatar-sample.jpg')}/>
          <Text style={styles.customerText}>{customerName}</Text>
        </View>
        <Button
          style={styles.infoBtn}
          icon={{
            iconDirection: 'right',
            iconName: Info
          }}
          onPress={handleOpenSetting}
        />
      </View>
      { isSettingOpen &&
        <View style={styles.settingSection}>
                <Button variant='outline' style={styles.btnSettings} icon={{ iconName: ListTodo, iconDirection: 'left' }} content='Xem nhiệm vụ' onPress={handleNavigateConversationTasks}/>
                <Button variant='outline' style={styles.btnSettings} icon={{ iconName: UserRoundSearch, iconDirection: 'left' }} content='Thông tin khách hàng' onPress={handleNavigateCustomerInfoScreen}/>
                <Button variant='outline' style={styles.btnSettings} icon={{ iconName: History, iconDirection: 'left' }} content='Xem lịch sử hỗ trợ' onPress={handleNavigateTicketScreen}/>
                 <Button variant='outline' style={styles.btnSettings} icon={{ iconName: History, iconDirection: 'left' }} content='Xem lịch sử đơn hàng' onPress={handleNavigateCustomerOrderScreen}/>
          </View>
      }
    </>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 0.1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 25,
            paddingHorizontal: 12,
      },
      nameContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
      },
      avatarImage: {
            width: 50,
            height: 50,
            borderRadius: 100
      },
      customerText: {
            fontSize: 14,
            fontWeight: 600
      },
      infoBtn: {
            width: 40,
            height: 40,
            borderRadius: 100
      },
      settingSection: {
            position: 'absolute',
            right: 25,
            top: 100,
            backgroundColor: '#ececec',
            width: 300,
            borderRadius: 15,
            paddingHorizontal: 10,
            paddingVertical: 10,
            zIndex: 999
      },
    btnSettings: {
            justifyContent:'flex-start',
            borderRadius: 0,
            paddingVertical: 15,
            paddingHorizontal: 10,
            borderWidth: 0,
  }
})