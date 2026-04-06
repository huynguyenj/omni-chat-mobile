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
            fontSize: 24,
            color: '#003366',
            fontWeight: 700
      },
      subtitle: {
            fontSize: 16,
            color: '#5A5E65',
            fontWeight: 600,
            width: '80%',
            marginTop: 10,
      }
})