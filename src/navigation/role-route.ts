import { AlertTriangle, Archive, BanknoteArrowUp, ClipboardClock, FileText, Hash, History, LayoutDashboard, MessageSquare, MessageSquareText, Newspaper, Package, ReceiptText, ShoppingCart, Truck, Users, Wallet } from "lucide-react-native";
import { TAB_LIST_ITEMS_TYPES } from "../types/route-type";
import StaffManagement from "@screens/manager/StaffManagement";
import KeywordManagement from "@screens/manager/KeywordManagement";
import ProductManagement from "@screens/manager/ProductManagement";
import StorageManagement from "@screens/manager/StorageManagement";
import ClaimManagement from "@screens/manager/ClaimManagement";
import AlertManagement from "@screens/manager/AlertManagement";
import ShipperManagement from "@screens/manager/ShipperManagement";
import OrderManagement from "@screens/manager/OrderManagement";
import DashboardScreen from "@screens/admin/DashboardScreen";
import RevenueScreen from "@screens/admin/RevenueScreen";
import ManageStaffScreen from "@screens/admin/ManageStaffScreen";
import ChatScreen from "@screens/staff/ChatScreen";
import ClaimScreen from "@screens/staff/ClaimScreen";
import TaskScreen from "@screens/staff/TaskScreen";
import OrderScreen from "@/screens/shipper/OrderScreen";
import OrderHistoryOrder from "@/screens/shipper/OrderHistoryOrder";
import ChatTemplateManagement from "@/screens/manager/ChatTemplateManagement";
import InvoiceManagement from "@/screens/manager/InvoiceManagement";
import WalletManagement from "@/screens/manager/WalletManagement";

const managerTabs: TAB_LIST_ITEMS_TYPES[] = [
  { route: 'Nhân viên',  label: 'Nhân viên',  icon: Users,         screen: StaffManagement },
  { route: 'Keywords',   label: 'Keywords',   icon: Hash,          screen: KeywordManagement },
  { route: 'Sản phẩm',  label: 'Sản phẩm',  icon: ShoppingCart,  screen: ProductManagement },
  { route: 'Kho hàng',  label: 'Kho hàng',  icon: Archive,       screen: StorageManagement },
  { route: 'Mẫu chat', label: 'Mẫu chat', icon: MessageSquareText, screen: ChatTemplateManagement },
  { route: 'Claim',      label: 'Yêu cầu',    icon: FileText,      screen: ClaimManagement },
  { route: 'Cảnh báo',  label: 'Cảnh báo',  icon: AlertTriangle, screen: AlertManagement },
  { route: 'Shipper',    label: 'Vận chuyển', icon: Truck,         screen: ShipperManagement },
  { route: 'Đơn hàng',  label: 'Đơn hàng',  icon: Package,       screen: OrderManagement },
  { route: 'Phiếu thanh toán', label: "Phiếu thanh toán", icon: ReceiptText, screen: InvoiceManagement },
  { route: 'Ví tiền', label: 'Ví tiền', icon: Wallet, screen: WalletManagement }
];

const adminTabs: TAB_LIST_ITEMS_TYPES[] = [
  { route: 'dashboard',    label: 'Tổng quan', icon: LayoutDashboard,  screen: DashboardScreen },
  { route: 'revenue',      label: 'Doanh thu', icon: BanknoteArrowUp,  screen: RevenueScreen },
  { route: 'manage-staff', label: 'Nhân viên', icon: Users,            screen: ManageStaffScreen },
];

const staffTabs: TAB_LIST_ITEMS_TYPES[] = [
  { route: 'Chat', label: 'Chat', icon: MessageSquare, screen: ChatScreen},
  { route: 'Claim', label: 'Claim', icon: Newspaper, screen: ClaimScreen},
  { route: 'Task History', label: 'Task History', icon: ClipboardClock, screen: TaskScreen }
]

const shipperTabs: TAB_LIST_ITEMS_TYPES[] = [
  { route: 'shipper/order', label: 'Đơn hàng', icon: Truck, screen: OrderScreen },
  { route: 'shipper/order-history', label: 'Lịch sử', icon: History, screen: OrderHistoryOrder }
]

export { managerTabs, adminTabs, staffTabs, shipperTabs }