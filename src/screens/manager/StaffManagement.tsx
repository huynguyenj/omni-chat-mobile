import { View, Text } from 'react-native'
import React from 'react'
import StaffManagementContent from '@/features/staff-manager/components/StaffManagementContent'

export default function StaffManagement() {
  return (
    <View style={{ flex:1 }}>
      <StaffManagementContent/>
    </View>
  )
}