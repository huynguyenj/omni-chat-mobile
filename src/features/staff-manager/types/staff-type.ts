export type StaffStatus = 'Online' | 'Offline'

export interface StaffIntentType {
  id: string
  intentTypeName: string
}

export interface StaffDetailType {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  status: StaffStatus;
  staffIntentTypes: StaffIntentType[];
}

export type StaffUpdateType = Pick<StaffDetailType, 'email' | 'phone' | 'name'> & {
  staffIntentTypes: { intentId: string }[] | []
}