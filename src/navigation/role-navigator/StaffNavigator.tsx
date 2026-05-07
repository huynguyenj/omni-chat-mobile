import React from 'react'
import BottomTabNavigator from '../custom-tab/BottomTabNavigator'
import { staffTabs } from '../role-route'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ChatDetail from '@/screens/staff/ChatDetail'
import OrderSectionScreen from '@/screens/staff/OrderSectionScreen'
import CustomerInfoScreen from '@/screens/staff/CustomerInfoScreen'
import ConversationTaskScreen from '@/screens/staff/ConversationTaskScreen'
import TicketScreen from '@/screens/staff/TicketScreen'

export type ChatStackParamList = {
  ChatScreen: undefined
  ChatDetail: { id: string }
  OrderSectionScreen: { customerId: string }
  CustomerInfoScreen: { conversationId: string }
  ConversationTaskScreen: { conversationId: string }
  TicketScreen: { customerId: string }
}

const Stack = createNativeStackNavigator<ChatStackParamList>()

const ChatTabs = () => {
  return <BottomTabNavigator routeList={staffTabs}/>
}

export default function StaffNavigator() {
  return (
      <Stack.Navigator>
                 <Stack.Screen
                       options={{
                             headerShown: false
                       }}
                       name='ChatScreen' component={ChatTabs}/>
                 <Stack.Screen 
                       options={{
                             headerShown: false
                       }}
                       name='ChatDetail' 
                       component={ChatDetail}/>
                  <Stack.Screen
                        options={{
                              headerShown: false
                        }}
                        name='OrderSectionScreen'
                        component={OrderSectionScreen}
                  />
                   <Stack.Screen
                       options={{
                             headerShown: false
                       }}
                       name='CustomerInfoScreen' component={CustomerInfoScreen}/>
                   <Stack.Screen
                       options={{
                             headerShown: false
                       }}
                       name='ConversationTaskScreen' component={ConversationTaskScreen}/>
                  <Stack.Screen
                       options={{
                             headerShown: false
                       }}
                       name='TicketScreen' component={TicketScreen}/>
           </Stack.Navigator>
  )
}