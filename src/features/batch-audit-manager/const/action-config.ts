import { LucideIcon, PackageMinus, PackagePlus, RotateCcw } from "lucide-react-native";

type ActionConfigType = {
      label: string
      icon: LucideIcon
      description: string
}

export const actionConfig: Record<string, ActionConfigType> = {
    Export: {
      label: 'Xuất kho',
      icon: PackageMinus,
      description: 'Đã giảm số lượng tồn kho',
    },
    Enter: {
      label: 'Nhập kho',
      icon: PackagePlus,
      description: 'Đã tăng số lượng tồn kho',
    },
    Adjust: {
      label: 'Xóa',
      icon: RotateCcw,
      description: 'Đã thay đổi số lượng tồn kho',
    },
  }