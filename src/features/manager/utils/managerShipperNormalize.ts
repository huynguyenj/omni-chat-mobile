import type { ManagerShipperApiItem } from '../types/shipper-type'

function num(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
}

function isObj(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}

function pickStr(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (c == null) continue
    const s = String(c).trim()
    if (s !== '') return s
  }
  return ''
}

function firstNonEmptyNested(root: Record<string, unknown>, keys: string[], fieldVariants: string[]): string {
  for (const nk of keys) {
    const inner = root[nk]
    if (!isObj(inner)) continue
    const v = pickStr(...fieldVariants.map((f) => inner[f]))
    if (v) return v
  }
  return ''
}

function combineFirstLast(src: Record<string, unknown>): string {
  const fn = pickStr(
    src.firstName,
    src.FirstName,
    src.first_name,
    src.givenName,
    src.GivenName,
    src.given_name
  )
  const ln = pickStr(
    src.lastName,
    src.LastName,
    src.last_name,
    src.surname,
    src.Surname,
    src.familyName,
    src.FamilyName,
    src.family_name
  )
  return `${fn} ${ln}`.trim()
}

function flattenShipperPayload(raw: unknown): Record<string, unknown> {
  const o = isObj(raw) ? { ...raw } : {}
  const innerKeys = [
    'shipper',
    'Shipper',
    'shipperProfile',
    'shipper_profile',
    'ShipperProfile',
    'applicationUser',
    'ApplicationUser',
    'application_user',
    'user',
    'User',
    'identityUser',
    'IdentityUser',
    'identity_user',
    'account',
    'Account',
    'profile',
    'Profile',
    'person',
    'Person',
    'staff',
    'Staff',
    'userInfo',
    'UserInfo',
    'shipperAccount',
    'ShipperAccount',
    'shipperDto',
    'ShipperDto'
  ]
  let merged: Record<string, unknown> = {}
  for (const k of innerKeys) {
    const inner = o[k]
    if (isObj(inner)) merged = { ...merged, ...inner }
  }
  return { ...merged, ...o }
}

export function normalizeShipper(raw: unknown): ManagerShipperApiItem {
  const o = flattenShipperPayload(raw)
  const nestedNameKeys = [
    'applicationUser',
    'ApplicationUser',
    'application_user',
    'user',
    'User',
    'identityUser',
    'IdentityUser',
    'identity_user',
    'shipperUser',
    'ShipperUser',
    'shipper_user',
    'shipperAccount',
    'ShipperAccount',
    'shipper_account',
    'account',
    'Account',
    'profile',
    'Profile',
    'person',
    'Person',
    'staff',
    'Staff',
    'userInfo',
    'UserInfo'
  ]
  const nestedNameFields = [
    'fullName',
    'FullName',
    'full_name',
    'name',
    'Name',
    'displayName',
    'DisplayName',
    'display_name',
    'userName',
    'UserName',
    'user_name',
    'email',
    'Email',
    'staffName',
    'StaffName',
    'staff_name',
    'employeeName',
    'EmployeeName',
    'employee_name'
  ]
  const fromNestedName = firstNonEmptyNested(o, nestedNameKeys, nestedNameFields)
  const fullName =
    pickStr(
      o.fullName,
      o.FullName,
      o.full_name,
      o.name,
      o.Name,
      o.displayName,
      o.DisplayName,
      o.display_name,
      o.userName,
      o.UserName,
      o.user_name,
      o.staffName,
      o.StaffName,
      o.staff_name,
      o.employeeName,
      o.EmployeeName,
      o.employee_name,
      fromNestedName,
      combineFirstLast(o),
      combineFirstLast(isObj(raw) ? (raw as Record<string, unknown>) : {})
    ) || 'Shipper'
  const nestedPhoneFields = [
    'phone',
    'Phone',
    'phoneNumber',
    'PhoneNumber',
    'phone_number',
    'mobile',
    'Mobile',
    'mobilePhone',
    'MobilePhone',
    'mobile_phone',
    'tel',
    'Tel',
    'telephone',
    'Telephone',
    'contactPhone',
    'ContactPhone',
    'contact_phone',
    'contactNumber',
    'ContactNumber',
    'contact_number'
  ]
  const fromNestedPhone = firstNonEmptyNested(o, nestedNameKeys, nestedPhoneFields)
  const phoneRaw = pickStr(
    o.phone,
    o.Phone,
    o.phoneNumber,
    o.PhoneNumber,
    o.phone_number,
    o.mobile,
    o.Mobile,
    o.mobilePhone,
    o.MobilePhone,
    o.mobile_phone,
    o.tel,
    o.Tel,
    o.telephone,
    o.Telephone,
    o.contactPhone,
    o.ContactPhone,
    o.contact_phone,
    o.contactNumber,
    o.ContactNumber,
    o.contact_number,
    o.customerPhone,
    o.CustomerPhone,
    o.customer_phone,
    fromNestedPhone
  )
  const deliveringCount = num(
    o.deliveringCount ??
      o.delivering_count ??
      o.deliveringOrders ??
      o.delivering_orders ??
      o.pendingDeliveries ??
      o.pending_deliveries ??
      o.activeDeliveryCount ??
      o.active_delivery_count ??
      o.dangGiao ??
      o.dang_giao
  )
  const deliveredCount = num(
    o.deliveredCount ??
      o.delivered_count ??
      o.deliveredOrders ??
      o.delivered_orders ??
      o.completedDeliveries ??
      o.completed_deliveries ??
      o.totalDelivered ??
      o.total_delivered ??
      o.daGiao ??
      o.da_giao
  )
  const userNameResolved = pickStr(o.userName, o.UserName, o.user_name, o.login, o.Login, o.email, o.Email)
  return {
    id: String(o.id ?? o.Id ?? o.shipperId ?? o.ShipperId ?? o.shipper_id ?? ''),
    fullName,
    userName: userNameResolved || undefined,
    phone: phoneRaw || undefined,
    shipperStatus: String(
      o.shipperStatus ?? o.ShipperStatus ?? o.shipper_status ?? o.status ?? o.Status ?? o.accountStatus ?? o.AccountStatus ?? 'Offline'
    ),
    deliveringCount,
    deliveredCount
  }
}

export function shipperIsOnline(item: ManagerShipperApiItem): boolean {
  const s = item.shipperStatus.toLowerCase()
  return (
    s === 'online' ||
    s === '1' ||
    s === 'true' ||
    s.includes('active') ||
    s.includes('hoạt động') ||
    s.includes('hoat dong')
  )
}

export function shipperActivityPill(item: ManagerShipperApiItem): { label: string; active: boolean } {
  const active = shipperIsOnline(item)
  return { label: active ? 'Hoạt động' : 'Tạm nghỉ', active }
}
