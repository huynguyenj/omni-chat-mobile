type SortByType = {
      label: string
      value: string
}

export const LIST_SORT_AUDIT_BY: SortByType[] = [
      { label: 'Ngày', value: 'createDate' },
      { label: 'Giá trị mới', value: 'newValue' },
      { label: 'Giá trị cũ', value: 'oldValue' },
]