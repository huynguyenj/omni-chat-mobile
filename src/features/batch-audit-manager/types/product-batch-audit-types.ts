export interface ProductBatchAuditItem {
  id: string
  productId: string
  productBatchId: string
  actionById: string
  staffName: string
  oldValue: number
  newValue: number
  action: string
  createDate: string
}

export interface ProductBatchAuditDetail extends ProductBatchAuditItem {
  brandName: string
  productName: string
  volumeML: number
  price: number
  productCode: string
  packagingType: string
  batchCode: string
  batchCreateDate: Date
  batchQuantity: number
  batchExpiredDate: Date
}