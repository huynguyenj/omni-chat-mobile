import { LucideIcon } from "lucide-react-native";
import { ComponentType } from "react";

export type TAB_LIST_ITEMS_TYPES = {
  route: string;
  label: string;
  icon: LucideIcon;
  screen: ComponentType<any>;
};
