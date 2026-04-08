import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import ClaimHeader from '@/features/claim/components/ClaimHeader'
import ClaimList from '@/features/claim/components/ClaimList'
import ClaimCreate from '@/features/claim/components/ClaimCreate'

export default function ClaimScreen() {
  return (
    <View style={styles.container}>
      <ClaimHeader/>
      <ClaimList/>
      <ClaimCreate/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    paddingHorizontal: 20,
    paddingVertical: 10,
  }
})