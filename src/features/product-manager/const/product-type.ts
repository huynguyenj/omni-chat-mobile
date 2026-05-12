type ProductType = {
   name: string
}

export const PRODUCT_TYPE: Record<string, ProductType> = {
  Sugar: {
    name: 'Có đường',
  },
  NoSugar: {
    name: 'Không đường',
  },
  Yogurt: {
    name: 'Sữa chua',
  }
}

export const PRODUCT_PACKAGE_TYPE: Record<string, ProductType> = {
  Bottle: {
    name: 'Chai',
  },
  Carton: {
    name: 'Hộp giấy',
  }
}