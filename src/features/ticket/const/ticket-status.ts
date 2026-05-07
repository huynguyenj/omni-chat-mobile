type TicketStatusType = {
   name: string
   tagVariant:'success' | 'danger' | 'warning' | 'default' | 'gray'
}

export const TICKET_CONVERSATION_STATUS: Record<string, TicketStatusType> = {
  Pending: {
    name: 'Đang hỗ trợ',
    tagVariant: 'warning'
  },
  Complete: {
    name: 'Hoàn thành',
    tagVariant: 'success'
  },
  Waiting: {
    name: 'Đang chờ hỗ trợ',
    tagVariant: 'gray'
  },
  Warning: {
    name: 'Cảnh báo',
    tagVariant: 'danger'
  }
}