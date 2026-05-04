export type ClaimCategory = {
      id: string
      typeName: string
}

export type ClaimCreation = {
      description: string
      reason: string
      staffId: string
      claimTypeId: string
      supportConversationId: string | null
}

export type ClaimType = {
      id: string
      claimType: string
      submitDate: string
      status: 'Pending' | 'Approved' | 'Rejected'
      description: string
      reason: string
    }
export type ConversationClaimType = {
      conversationId: string
      customerName: string
}