export interface OrderItem {
  id: string;
  quantity: number;
  productName: string;
  itemsPrice: number;
}

export interface OrderShipperType {
  id: string;
  customerName: string;
  customerPhoneNumber: string;
  customerAddress: string;
  name: string;
  totalAmount: number;
  deliveryStatus: 'Pending' | 'Completed';
  code: string;
  deliveriedDate: Date;
  orderItems: OrderItem[];
}