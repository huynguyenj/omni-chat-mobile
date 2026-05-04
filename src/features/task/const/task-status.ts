
type TaskStatusType = {
  name: string
  tagVariant: 'success' | 'danger' | 'warning' | 'default' | 'gray'
}
export const TASK_STATUS: Record<string, TaskStatusType> = {
  New: {
    name: 'Mới',
    tagVariant: 'default'
  },
  InProgress: {
    name: 'Đang thực hiện',
    tagVariant: 'gray'
  },
  PendingReassign: {
    name: 'Đang chuyển hướng',
    tagVariant: 'warning'
  },
  Done: {
    name: 'Hoàn thành',
    tagVariant: 'success'
  },
  Cancelled: {
    name: 'Đã hủy',
    tagVariant: 'danger'
  },
  Closed: {
    name: 'Đã đóng',
    tagVariant: 'gray'
  }
}

