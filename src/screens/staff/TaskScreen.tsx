import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import TaskHeader from '@/features/task/components/TaskHeader'
import TaskList from '@/features/task/components/TaskList'

export default function TaskScreen() {
  return (
    <View style={styles.container}>
      <TaskHeader/>
      <TaskList/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  }
})