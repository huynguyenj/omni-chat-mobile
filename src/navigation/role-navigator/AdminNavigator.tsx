import { View, Text } from 'react-native'
import React from 'react'
import BottomTabNavigator from '../custom-tab/BottomTabNavigator'
import { adminTabs } from '../role-route'

export default function AdminNavigator() {
  return (
    <BottomTabNavigator routeList={adminTabs}/>
  )
}