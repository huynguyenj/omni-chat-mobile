      import { PaginationStructure } from "@/types/api.response"
      import { OrderShipperType } from "./order-shipper"

      export type OrderHistoryType = {
            totalDeliveredOrders: number
            orders: PaginationStructure<OrderShipperType>
      }