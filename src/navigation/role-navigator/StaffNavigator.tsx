import React from 'react'
import BottomTabNavigator from '../custom-tab/BottomTabNavigator'
import { staffTabs } from '../role-route'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ChatDetail from '@/screens/staff/ChatDetail'

export type ChatStackParamList = {
  ChatScreen: undefined
  ChatDetail: { id: string }
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
           </Stack.Navigator>
  )
}