export type ProductType = {
  productId: string
  productName: string
  productCode: string
  productImageUrl: string
}

export interface ProductDetailType {
  id: string;
  imageUrl: string;
  name: string;
  productKind: string
  productPackagingType: string
  volumeMl: number;
  description: string;
  brandId: string;
  brand: string;
  price: number;
  code: string;
  quantity: number;
  lifeSpan: number;
}

export type BrandType = Pick<ProductDetailType, 'name' | 'id'>

type VolumeType = {
  volume: number
  quantity: number
}

type ProductKind = {
  kindName: string
  volumes: VolumeType[]
}

export type ProductStorageType = {
  totalProduct: number
  productKinds: ProductKind[]
}