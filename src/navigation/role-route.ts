import { AlertTriangle, Archive, BanknoteArrowUp, ClipboardClock, FileText, Hash, LayoutDashboard, MessageSquare, Newspaper, Package, ShoppingCart, Truck, Users } from "lucide-react-native";
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

const managerTabs: TAB_LIST_ITEMS_TYPES[] = [
  { route: 'Nhân viên',  label: 'Nhân viên',  icon: Users,         screen: StaffManagement },
  { route: 'Keywords',   label: 'Keywords',   icon: Hash,          screen: KeywordManagement },
  { route: 'Sản phẩm',  label: 'Sản phẩm',  icon: ShoppingCart,  screen: ProductManagement },
  { route: 'Kho hàng',  label: 'Kho hàng',  icon: Archive,       screen: StorageManagement },
  { route: 'Claim',      label: 'Claim',      icon: FileText,      screen: ClaimManagement },
  { route: 'Cảnh báo',  label: 'Cảnh báo',  icon: AlertTriangle, screen: AlertManagement },
  { route: 'Shipper',    label: 'Shipper',    icon: Truck,         screen: ShipperManagement },
  { route: 'Đơn hàng',  label: 'Đơn hàng',  icon: Package,       screen: OrderManagement },
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

export { managerTabs, adminTabs, staffTabs }