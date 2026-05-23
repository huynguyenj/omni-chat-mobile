import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import ChatTemplateMainContent from '@/features/chat-template-manager/components/ChatTemplateMainContent'

export default function ChatTemplateScreen() {
  return (
    <View style={styles.container}>
      <ChatTemplateMainContent/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  }
})