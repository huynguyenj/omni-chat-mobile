export type TaskIntentCount = {
  intentName: string
  taskCount: number
}

export type TaskIntentMonthRow = {
  month: number
  intents: TaskIntentCount[]
}
