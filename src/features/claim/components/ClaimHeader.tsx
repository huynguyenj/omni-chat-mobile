import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function ClaimHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Các đơn có sẵn</Text>
      <Text style={styles.subtitle}>Xem các đơn và trạng thái của các đơn</Text>
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 0.15
      },
      title: {
            fontSize: 22,
            color: '#003366',
            fontWeight: 700
      },
      subtitle: {
            fontSize: 15,
            color: '#5A5E65',
            fontWeight: 600,
            marginTop: 5,
      }
})