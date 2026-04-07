import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function TaskHeader() {
  return (
    <View style={styles.container}>
         <Text style={styles.title}>Lịch sử task</Text>
         <Text style={styles.subtitle}>Xem lại tất cả các task đã làm</Text>
    </View>
  )
}

const styles = StyleSheet.create({
      container: {
            flex: 0.1
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