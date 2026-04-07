import React from 'react'
import { ChatProvider } from '@/features/chat/context/ChatProvider'
import MessageTabs from '@/features/chat/components/MessageTabs'
import ListMessageSection from '@/features/chat/components/ListMessageSection'

export default function ChatScreen() {
  return (
    <ChatProvider>
      <MessageTabs/>
      <ListMessageSection/>
    </ChatProvider>
  )
}