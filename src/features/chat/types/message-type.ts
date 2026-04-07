import { KeywordsRecommendation } from "./system-recommendation"

export type ResolveMessageType = {
  conversationId: string
  customerName: string
  avartarUrl: string
  providerName: string
  lastMessage: string
  updateDate: string
  unreadMessageCount: number
}

export interface MessageType {
   senderType: string
   senderId: string
   content: string
   timestamp: number
   extractKeywordsResponses?: null | KeywordsRecommendation
}

export type SenderMessage = {
  SupportConversationId?: string | null
  StaffId: string
  Content: string
}

export type ConversationDetail = {
  id: string
  createdDate: Date
  status: string
  isDistributed: boolean
  customerName: string
  avartarUrl: string
  activeStaffId: string
  activeCustomerId: string
  providerId: string
  messages: MessageType[]
}