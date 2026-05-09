type ProductFilterAndSortType = {
   label: string
   value: string
}
export const LIST_PRODUCT_KIND_FILTER: ProductFilterAndSortType[] = [
   { label: 'Có đường', value: 'Sugar' },
   { label: 'Không đường', value: 'NoSugar' },
   { label: 'Sữa chua', value: 'Yogurt' },
]
export const LIST_PRODUCT_PACKAGE_TYPE: ProductFilterAndSortType[] = [
   { label: 'Chai', value: 'Bottle' },
   { label: 'Hộp giấy', value: 'Carton' },
]
export const LIST_PRODUCT_CAPACITY: ProductFilterAndSortType[] = [
   { label: '180ml', value: '180' },
   { label: '490ml', value: '490' },
   { label: '880ml', value: '880' },
   { label: '1760ml', value: '1760' },
]

export const PRODUCT_LIST_SORT_BY: ProductFilterAndSortType[] = [
   { label: 'Tên', value: 'name' },
   { label: 'Code', value: 'code' },
   { label: 'Số lượng', value: 'quantity' },
   { label: 'Dung tích', value: 'volumeml' },
   { label: 'Giá', value: 'price' },
   { label: 'Hãng', value: 'brand' },
   { label: 'Ngày tạo', value: 'createdate' }
]