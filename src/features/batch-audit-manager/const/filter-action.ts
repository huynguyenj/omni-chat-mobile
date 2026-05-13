type FilterActionType = {
      label: string
      value: string
}

export const LIST_FILTER_ACTION: FilterActionType[] = [
   { label: 'Nhập kho', value: 'Enter' },
   { label: 'Xuất kho', value: 'Export' },
   { label: 'Loại bỏ', value: 'Remove' },
]