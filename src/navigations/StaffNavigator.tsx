import { View, Text } from 'react-native'
import React from 'react'
import BottomTabNavigator from './BottomTabNavigator'
import { staffTabs } from './role-route'

export default function StaffNavigator() {
  return (
      <BottomTabNavigator routeList={staffTabs}/>
  )
}