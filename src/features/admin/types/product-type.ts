export type ProductPackagingType = 'Bottle' | 'Carton'

export type ProductType = {
  id: string
  imageUrl: string
  name: string
  productPackagingType: ProductPackagingType
  volumeMl: number
  description: string
  brand: string | null
  price: number
  code: string
  quantity: number
  lifeSpan: number
}

export type PaginationMeta = {
  total_pages: number
  total_items: number
  current_page: number
  page_size: number
}

export type ProductListResponse = {
  items: ProductType[]
  meta: PaginationMeta
}
