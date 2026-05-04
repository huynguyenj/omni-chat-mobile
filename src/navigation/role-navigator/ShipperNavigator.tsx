import { View, Text } from 'react-native'
import React from 'react'
import BottomTabNavigator from '../custom-tab/BottomTabNavigator'
import { shipperTabs } from '../role-route'

export default function ShipperNavigator() {
  return (
   <BottomTabNavigator routeList={shipperTabs}/>
  )
}