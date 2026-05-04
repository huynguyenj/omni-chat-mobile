export type AnalysisTaskType = {
  totalDoneTask: number
  totalCreateOrder: number
  afferageResolveTime: number
  staffPerformance: number
}

export type IntentType = {
  id: string
  typeName: string
  description: string
}

export interface TaskType {
  id: string
  intentTypeName: string
  status: string
  createdAt: string
}

export type TaskListType = Omit<TaskType, 'createAt'> & {
  completedAt: Date
  customerName: string
}

export type SearchTaskType = {
  taskName?: string | null
  fromDate?: Date
  toDate?: Date
  intentTypeId?: string | null
  page: number,
  pageSize: number
}