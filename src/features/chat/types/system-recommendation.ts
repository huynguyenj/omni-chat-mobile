import { CustomerInfoType } from "./customer-type";
import { OrderType } from "../../order/types/order-type";
import { ProductType } from "../../order/types/product-type";

export type Recommendation =
  | { recommendType: 'SearchOrderHistory'; data: OrderType }
  | { recommendType: 'SearchProduct'; data: ProductType }
  | { recommendType: 'SearchCustomerInfo'; data: CustomerInfoType }
export type KeywordsRecommendation = {
  highlights: string[]
  recommends: Recommendation[]
}