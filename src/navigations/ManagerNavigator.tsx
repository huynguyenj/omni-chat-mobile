import { View, Text } from 'react-native'
import React from 'react'
import DrawerNavigator from './DrawNavigator'
import { managerTabs } from './role-route'

export default function ManagerNavigator() {
  return (
    <DrawerNavigator routeList={managerTabs}/>
  )
}