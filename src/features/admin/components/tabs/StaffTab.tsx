import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { ChevronDown, ChevronUp, Edit3, Plus, Trash2 } from 'lucide-react-native'
import Card from '@/components/ui/cards/Card'
import { IntentTypeApi, type IntentTypeItem } from '../../api/intent-type-api'
import { RolesApi, type RoleItem } from '../../api/roles-api'
import { StaffApi } from '../../api/staff-api'
import type { StaffItem } from '../../types/staff-type'
import { extractArrayFromResponse } from '../../utils/api-helpers'
import { notifyError, notifyInfo, notifySuccess } from '../../utils/notify'

type StaffModalMode = 'create' | 'edit'

type StaffFormState = {
  name: string
  email: string
  phone: string
  roleId: string
  intentTypeIds: string[]
}

type StaffFieldKey = 'name' | 'email' | 'phone' | 'role'
type StaffFormErrors = Partial<Record<StaffFieldKey, string>>

const EMPTY_FORM: StaffFormState = {
  name: '',
  email: '',
  phone: '',
  roleId: '',
  intentTypeIds: []
}

const STAFFS_PER_PAGE = 9
const LOG_PREFIX = '[Admin/Staff]'
const NAME_MIN_LEN = 2
const NAME_MAX_LEN = 50
const EMAIL_MIN_LEN = 5
const EMAIL_MAX_LEN = 254
const VN_PHONE_LEN_MIN = 10
const VN_PHONE_LEN_MAX = 11
const DANGEROUS_NAME_CHARS = /[<>{};]/
const NAME_ALLOWED_CHARS = /^[\p{L}\s]+$/u
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VN_MOBILE_REGEX = /^0[35789]\d{8,9}$/

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function staffIntentPayloadFromIds(ids: string[]) {
  return ids.map((intentId) => ({ intentId }))
}

function validateStaffName(raw: string): { ok: true; value: string } | { ok: false; message: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, message: 'Họ và tên không được để trống.' }
  if (trimmed.length < NAME_MIN_LEN || trimmed.length > NAME_MAX_LEN) {
    return {
      ok: false,
      message: `Họ và tên phải từ ${NAME_MIN_LEN} đến ${NAME_MAX_LEN} ký tự (đã loại khoảng trắng đầu/cuối).`
    }
  }
  if (DANGEROUS_NAME_CHARS.test(trimmed)) {
    return { ok: false, message: 'Họ và tên không được chứa các ký tự: < > { } ;' }
  }
  if (!NAME_ALLOWED_CHARS.test(trimmed)) {
    return { ok: false, message: 'Họ và tên chỉ được phép chữ cái (có dấu tiếng Việt) và khoảng trắng.' }
  }
  return { ok: true, value: trimmed }
}

function validateStaffEmail(raw: string): { ok: true; value: string } | { ok: false; message: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, message: 'Email không được để trống.' }
  if (trimmed.length < EMAIL_MIN_LEN) {
    return { ok: false, message: `Email phải có ít nhất ${EMAIL_MIN_LEN} ký tự.` }
  }
  if (trimmed.length > EMAIL_MAX_LEN) {
    return { ok: false, message: `Email không được vượt quá ${EMAIL_MAX_LEN} ký tự.` }
  }
  if (!EMAIL_FORMAT.test(trimmed)) {
    return { ok: false, message: 'Email không đúng định dạng.' }
  }
  return { ok: true, value: trimmed }
}

function validateStaffPhoneDigits(digits: string): { ok: true; value: string } | { ok: false; message: string } {
  if (!digits) return { ok: false, message: 'Số điện thoại không được để trống.' }
  if (!/^\d+$/.test(digits)) return { ok: false, message: 'Số điện thoại chỉ được nhập số.' }
  if (digits.length < VN_PHONE_LEN_MIN || digits.length > VN_PHONE_LEN_MAX) {
    return {
      ok: false,
      message: `Số điện thoại phải có từ ${VN_PHONE_LEN_MIN} đến ${VN_PHONE_LEN_MAX} số.`
    }
  }
  if (!digits.startsWith('0')) {
    return { ok: false, message: 'Số điện thoại phải bắt đầu bằng số 0.' }
  }
  if (!VN_MOBILE_REGEX.test(digits)) {
    return {
      ok: false,
      message: 'Số điện thoại không đúng định dạng Việt Nam (0 + 3/5/7/8/9 + 8–9 số tiếp theo).'
    }
  }
  return { ok: true, value: digits }
}

function getDuplicateAddFieldErrors(
  apiStaffs: StaffItem[],
  emailNorm: string,
  phoneDigits: string
): Pick<StaffFormErrors, 'email' | 'phone'> {
  const errors: Pick<StaffFormErrors, 'email' | 'phone'> = {}
  const emailTaken = apiStaffs.some((s) => s.email.trim().toLowerCase() === emailNorm)
  const phoneTaken = phoneDigits.length > 0 && apiStaffs.some((s) => digitsOnly(s.phone ?? '') === phoneDigits)
  if (emailTaken) errors.email = 'Email đã được đăng ký cho tài khoản khác.'
  if (phoneTaken) errors.phone = 'Số điện thoại đã được đăng ký cho tài khoản khác.'
  return errors
}

function getDuplicateEditFieldErrors(
  apiStaffs: StaffItem[],
  excludeStaffId: string,
  emailNorm: string,
  phoneDigits: string
): Pick<StaffFormErrors, 'email' | 'phone'> {
  const errors: Pick<StaffFormErrors, 'email' | 'phone'> = {}
  const emailTaken = apiStaffs.some(
    (s) => s.id !== excludeStaffId && s.email.trim().toLowerCase() === emailNorm
  )
  const phoneTaken =
    phoneDigits.length > 0 &&
    apiStaffs.some((s) => s.id !== excludeStaffId && digitsOnly(s.phone ?? '') === phoneDigits)
  if (emailTaken) errors.email = 'Email đã được đăng ký cho tài khoản khác.'
  if (phoneTaken) errors.phone = 'Số điện thoại đã được đăng ký cho tài khoản khác.'
  return errors
}

function RoleSelectDropdown({
  roles,
  loading,
  value,
  onChange,
  error
}: {
  roles: RoleItem[]
  loading: boolean
  value: string
  onChange: (roleId: string) => void
  error?: string
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const triggerLabel = useMemo(() => {
    if (loading) return 'Đang tải danh sách...'
    if (roles.length === 0) return 'Chưa có vai trò'
    if (!value) return '-- Chọn vai trò --'
    return roles.find((r) => r.id === value)?.name ?? '-- Chọn vai trò --'
  }, [roles, loading, value])

  const canOpen = !loading && roles.length > 0

  const selectRole = (roleId: string) => {
    onChange(roleId)
    setDropdownOpen(false)
  }

  return (
    <>
      <Text style={styles.inputLabel}>Vai trò</Text>
      <TouchableOpacity
        style={[
          styles.intentTrigger,
          dropdownOpen && styles.intentTriggerOpen,
          !canOpen && styles.intentTriggerDisabled,
          error ? styles.inputErrorBorder : null
        ]}
        onPress={() => canOpen && setDropdownOpen((o) => !o)}
        activeOpacity={0.8}
        disabled={!canOpen}
      >
        <Text style={[styles.intentTriggerText, !value && styles.intentTriggerPlaceholder]} numberOfLines={1}>
          {triggerLabel}
        </Text>
        {loading ? (
          <ActivityIndicator color="#3366CC" size="small" />
        ) : dropdownOpen ? (
          <ChevronUp size={20} color="#64748b" strokeWidth={2.2} />
        ) : (
          <ChevronDown size={20} color="#64748b" strokeWidth={2.2} />
        )}
      </TouchableOpacity>

      {roles.length === 0 && !loading ? (
        <Text style={styles.pickerEmpty}>Chưa có dữ liệu vai trò. Thử tải lại trang.</Text>
      ) : null}

      {dropdownOpen && canOpen ? (
        <View style={styles.intentDropdown}>
          <ScrollView style={styles.intentDropdownScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {roles.map((role, index) => {
              const selected = value === role.id
              return (
                <TouchableOpacity
                  key={role.id}
                  style={[styles.intentItem, index === 0 && styles.intentItemFirst]}
                  onPress={() => selectRole(role.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.intentCheckbox, selected && styles.intentCheckboxChecked]}>
                    {selected ? <Text style={styles.intentCheckMark}>✓</Text> : null}
                  </View>
                  <View style={styles.intentItemText}>
                    <Text style={styles.intentTypeName}>{role.name}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </>
  )
}

function IntentTypeMultiSelect({
  intentTypes,
  loading,
  selectedIds,
  onChange
}: {
  intentTypes: IntentTypeItem[]
  loading: boolean
  selectedIds: string[]
  onChange: (next: string[]) => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id])
  }

  const triggerLabel = useMemo(() => {
    if (loading) return 'Đang tải danh sách...'
    if (intentTypes.length === 0) return 'Chưa có loại chức năng'
    if (selectedIds.length === 0) return '-- Chọn loại chức năng --'
    const names = intentTypes.filter((it) => selectedIds.includes(it.id)).map((it) => it.typeName)
    if (names.length <= 2) return names.join(', ')
    return `${names.length} loại đã chọn`
  }, [intentTypes, loading, selectedIds])

  const canOpen = !loading && intentTypes.length > 0

  return (
    <>
      <Text style={styles.inputLabel}>Loại chức năng</Text>
      <TouchableOpacity
        style={[styles.intentTrigger, dropdownOpen && styles.intentTriggerOpen, !canOpen && styles.intentTriggerDisabled]}
        onPress={() => canOpen && setDropdownOpen((o) => !o)}
        activeOpacity={0.8}
        disabled={!canOpen}
      >
        <Text
          style={[styles.intentTriggerText, selectedIds.length === 0 && styles.intentTriggerPlaceholder]}
          numberOfLines={1}
        >
          {triggerLabel}
        </Text>
        {loading ? (
          <ActivityIndicator color="#3366CC" size="small" />
        ) : dropdownOpen ? (
          <ChevronUp size={20} color="#64748b" strokeWidth={2.2} />
        ) : (
          <ChevronDown size={20} color="#64748b" strokeWidth={2.2} />
        )}
      </TouchableOpacity>

      {intentTypes.length === 0 && !loading ? (
        <Text style={styles.pickerEmpty}>Chưa có dữ liệu loại chức năng. Thử tải lại trang.</Text>
      ) : null}

      {dropdownOpen && canOpen ? (
        <View style={styles.intentDropdown}>
          <ScrollView style={styles.intentDropdownScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {intentTypes.map((it, index) => {
              const checked = selectedIds.includes(it.id)
              return (
                <TouchableOpacity
                  key={it.id}
                  style={[styles.intentItem, index === 0 && styles.intentItemFirst]}
                  onPress={() => toggle(it.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.intentCheckbox, checked && styles.intentCheckboxChecked]}>
                    {checked ? <Text style={styles.intentCheckMark}>✓</Text> : null}
                  </View>
                  <View style={styles.intentItemText}>
                    <Text style={styles.intentTypeName}>{it.typeName}</Text>
                    {it.description ? <Text style={styles.intentDesc}>{it.description}</Text> : null}
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      ) : null}
    </>
  )
}

export default function StaffTab() {
  const [loading, setLoading] = useState(false)
  const [apiStaffs, setApiStaffs] = useState<StaffItem[]>([])
  const [staffPage, setStaffPage] = useState(1)

  const [roles, setRoles] = useState<RoleItem[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)

  const [intentTypes, setIntentTypes] = useState<IntentTypeItem[]>([])
  const [intentTypesLoading, setIntentTypesLoading] = useState(false)

  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<StaffModalMode>('create')
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null)
  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<StaffFormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchStaffs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await StaffApi.getStaffs({ pageNumber: 1, pageSize: 100, descending: false })
      setApiStaffs(Array.isArray(data.items) ? data.items : (extractArrayFromResponse(data) as StaffItem[]))
    } catch {
      notifyError('Không tải được danh sách nhân viên.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRoles = useCallback(async () => {
    setRolesLoading(true)
    console.log(`${LOG_PREFIX} Quản lý tài khoản — bắt đầu tải vai trò`)
    try {
      const list = await RolesApi.getRoles()
      setRoles(list)
      console.log(`${LOG_PREFIX} Quản lý tài khoản — gán roles vào form`, { tong: list.length })
    } catch (error) {
      console.error(`${LOG_PREFIX} Quản lý tài khoản — lỗi tải vai trò`, error)
      setRoles([])
      notifyError('Không tải được danh sách role.')
    } finally {
      setRolesLoading(false)
    }
  }, [])

  const fetchIntentTypes = useCallback(async () => {
    setIntentTypesLoading(true)
    try {
      const list = await IntentTypeApi.getIntentTypes()
      setIntentTypes(list)
    } catch {
      setIntentTypes([])
      notifyError('Không tải được danh sách loại intent.')
    } finally {
      setIntentTypesLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchStaffs()
    void fetchRoles()
    void fetchIntentTypes()
  }, [fetchIntentTypes, fetchRoles, fetchStaffs])

  const uiStaffs = useMemo(() => {
    return apiStaffs.map((staff) => ({
      ...staff,
      uiRole: staff.roleName?.trim() || (staff.staffIntentTypes.length > 0 ? 'Staff' : 'Manager'),
      department:
        staff.staffIntentTypes.length > 0
          ? staff.staffIntentTypes.map((i) => i.intentTypeName).join(', ')
          : 'Chưa phân loại',
      statusLabel: staff.status.toLowerCase() === 'online' ? 'Hoạt động' : 'Nghỉ'
    }))
  }, [apiStaffs])

  const totalStaffPages = Math.max(1, Math.ceil(uiStaffs.length / STAFFS_PER_PAGE))
  const effectiveStaffPage = Math.min(staffPage, totalStaffPages)
  const paginatedStaffs = useMemo(() => {
    const start = (effectiveStaffPage - 1) * STAFFS_PER_PAGE
    return uiStaffs.slice(start, start + STAFFS_PER_PAGE)
  }, [uiStaffs, effectiveStaffPage])

  const mapStaffToIntentIds = (staff: StaffItem, types: IntentTypeItem[]) => {
    if (!staff.staffIntentTypes?.length || types.length === 0) return []
    return types
      .filter((it) =>
        staff.staffIntentTypes.some((s) => s.id === it.id || s.intentTypeName === it.typeName)
      )
      .map((it) => it.id)
  }

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedStaff(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setModalVisible(true)
  }

  const openEditModal = (staff: StaffItem) => {
    const matchedStaff = apiStaffs.find((s) => s.id === staff.id)
    setModalMode('edit')
    setSelectedStaff(staff)
    setForm({
      name: staff.name,
      email: staff.email,
      phone: digitsOnly(matchedStaff?.phone ?? staff.phone ?? ''),
      roleId: matchedStaff?.roleId ?? staff.roleId ?? '',
      intentTypeIds: mapStaffToIntentIds(matchedStaff ?? staff, intentTypes)
    })
    setFormErrors({})
    setModalVisible(true)
  }

  const closeModal = () => {
    if (submitting) return
    setModalVisible(false)
  }

  const validateForm = (): boolean => {
    const errors: StaffFormErrors = {}
    const nameResult = validateStaffName(form.name)
    if (!nameResult.ok) errors.name = nameResult.message

    const emailResult = validateStaffEmail(form.email)
    if (!emailResult.ok) errors.email = emailResult.message

    const phoneDigits = digitsOnly(form.phone)
    const phoneResult = validateStaffPhoneDigits(phoneDigits)
    if (!phoneResult.ok) errors.phone = phoneResult.message

    if (modalMode === 'create' && !form.roleId.trim()) {
      errors.role = 'Vui lòng chọn vai trò.'
    }

    const emailNorm = emailResult.ok ? emailResult.value.toLowerCase() : ''
    const phoneOk = phoneResult.ok ? phoneResult.value : ''
    const dupErrors =
      modalMode === 'create'
        ? getDuplicateAddFieldErrors(apiStaffs, emailNorm, phoneOk)
        : selectedStaff
          ? getDuplicateEditFieldErrors(apiStaffs, selectedStaff.id, emailNorm, phoneOk)
          : {}

    Object.assign(errors, dupErrors)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      notifyError('Vui lòng kiểm tra lại thông tin đã nhập.')
      return false
    }
    return true
  }

  const submitForm = async () => {
    if (!validateForm()) return

    const nameResult = validateStaffName(form.name)
    const emailResult = validateStaffEmail(form.email)
    const phoneResult = validateStaffPhoneDigits(digitsOnly(form.phone))
    if (!nameResult.ok || !emailResult.ok || !phoneResult.ok) return

    setSubmitting(true)
    try {
      if (modalMode === 'create') {
        await StaffApi.createStaff({
          name: nameResult.value,
          email: emailResult.value,
          phone: phoneResult.value,
          roleId: form.roleId,
          staffIntentTypes: staffIntentPayloadFromIds(form.intentTypeIds)
        })
        notifySuccess('Thêm tài khoản thành công')
      } else if (selectedStaff) {
        await StaffApi.updateStaff(selectedStaff.id, {
          name: nameResult.value,
          email: emailResult.value,
          phone: phoneResult.value,
          staffIntentTypes: staffIntentPayloadFromIds(form.intentTypeIds)
        })
        notifySuccess('Cập nhật thành công')
      }

      setModalVisible(false)
      setForm(EMPTY_FORM)
      setSelectedStaff(null)
      await fetchStaffs()
    } catch {
      notifyError(modalMode === 'create' ? 'Không thể tạo tài khoản.' : 'Không thể cập nhật tài khoản.')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDeleteStaff = (staff: StaffItem) => {
    Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa tài khoản "${staff.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => void handleDeleteStaff(staff.id)
      }
    ])
  }

  const handleDeleteStaff = async (id: string) => {
    try {
      await StaffApi.deleteStaff(id)
      notifySuccess('Xóa tài khoản thành công')
      await fetchStaffs()
    } catch {
      notifyError('Không thể xóa tài khoản.')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Quản lý tài khoản</Text>
          <Text style={styles.subtitle}>{uiStaffs.length} tài khoản trong hệ thống</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
          <Plus size={16} color="#fff" />
          <Text style={styles.addBtnText}>Thêm</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#3366CC" />
      ) : (
        <View style={styles.staffList}>
          {paginatedStaffs.map((staff) => (
            <Card key={staff.id} style={styles.staffCard}>
              <View style={styles.staffTopRow}>
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>{staff.name?.charAt(0) ?? '?'}</Text>
                </View>
                <View style={styles.staffMainInfo}>
                  <Text style={styles.staffName} numberOfLines={1}>
                    {staff.name}
                  </Text>
                  <Text style={styles.staffSmall} numberOfLines={1}>
                    {staff.email}
                  </Text>
                  <Text style={styles.staffSmall} numberOfLines={1}>
                    {staff.phone || '—'}
                  </Text>
                </View>
              </View>

              <View style={styles.badgesRow}>
                <View style={[styles.badge, staff.uiRole === 'Manager' ? styles.badgeManager : styles.badgeStaff]}>
                  <Text style={styles.badgeText}>{staff.uiRole}</Text>
                </View>
                <View
                  style={[styles.badge, staff.statusLabel === 'Hoạt động' ? styles.badgeActive : styles.badgeInactive]}
                >
                  <Text style={styles.badgeText}>{staff.statusLabel}</Text>
                </View>
              </View>

              <Text style={styles.departmentLabel}>Phòng ban</Text>
              <Text style={styles.departmentValue} numberOfLines={2}>
                {staff.department}
              </Text>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(staff)}>
                  <Edit3 size={14} color="#3366CC" />
                  <Text style={styles.editBtnText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDeleteStaff(staff)}>
                  <Trash2 size={14} color="#DC2626" />
                  <Text style={styles.deleteBtnText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}

      <View style={styles.pager}>
        <TouchableOpacity
          disabled={effectiveStaffPage === 1}
          onPress={() => setStaffPage((p) => Math.max(1, p - 1))}
          style={[styles.pagerBtn, effectiveStaffPage === 1 && styles.btnDisabled]}
        >
          <Text style={styles.pagerText}>Trước</Text>
        </TouchableOpacity>
        <Text style={styles.pageText}>
          Trang {effectiveStaffPage}/{totalStaffPages}
        </Text>
        <TouchableOpacity
          disabled={effectiveStaffPage === totalStaffPages}
          onPress={() => setStaffPage((p) => Math.min(totalStaffPages, p + 1))}
          style={[styles.pagerBtn, effectiveStaffPage === totalStaffPages && styles.btnDisabled]}
        >
          <Text style={styles.pagerText}>Sau</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {modalMode === 'create' ? 'Thêm tài khoản mới' : 'Sửa thông tin tài khoản'}
            </Text>

            <ScrollView style={styles.formWrap}>
              <Text style={styles.inputLabel}>Họ và tên</Text>
              <TextInput
                value={form.name}
                onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
                style={[styles.input, formErrors.name && styles.inputError]}
                placeholder="Nhập họ và tên"
              />
              {formErrors.name ? <Text style={styles.errorText}>{formErrors.name}</Text> : null}

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={form.email}
                onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
                style={[styles.input, formErrors.email && styles.inputError]}
                placeholder="example@omnichat.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {formErrors.email ? <Text style={styles.errorText}>{formErrors.email}</Text> : null}

              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                value={form.phone}
                onChangeText={(value) =>
                  setForm((prev) => ({ ...prev, phone: digitsOnly(value).slice(0, VN_PHONE_LEN_MAX) }))
                }
                style={[styles.input, formErrors.phone && styles.inputError]}
                placeholder="0912345678"
                keyboardType="phone-pad"
              />
              {formErrors.phone ? <Text style={styles.errorText}>{formErrors.phone}</Text> : null}

              {modalMode === 'create' ? (
                <RoleSelectDropdown
                  key={modalVisible ? `role-${selectedStaff?.id ?? 'create'}` : 'role-closed'}
                  roles={roles}
                  loading={rolesLoading}
                  value={form.roleId}
                  onChange={(roleId) => setForm((prev) => ({ ...prev, roleId }))}
                  error={formErrors.role}
                />
              ) : null}

              <IntentTypeMultiSelect
                key={modalVisible ? `${modalMode}-${selectedStaff?.id ?? 'create'}` : 'closed'}
                intentTypes={intentTypes}
                loading={intentTypesLoading}
                selectedIds={form.intentTypeIds}
                onChange={(intentTypeIds) => setForm((prev) => ({ ...prev, intentTypeIds }))}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.btnDisabled]}
                onPress={() => void submitForm()}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Đang lưu...' : modalMode === 'create' ? 'Tạo' : 'Lưu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { fontSize: 22, fontWeight: '700', color: '#003366' },
  subtitle: { marginTop: 4, color: '#6B7280', fontSize: 12 },
  addBtn: {
    backgroundColor: '#3366CC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  staffList: { gap: 10 },
  staffCard: { paddingVertical: 14 },
  staffTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3366CC',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  staffMainInfo: { flex: 1 },
  staffName: { fontWeight: '700', color: '#003366' },
  staffSmall: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  badgeManager: { backgroundColor: '#8B5CF6' },
  badgeStaff: { backgroundColor: '#3366CC' },
  badgeActive: { backgroundColor: '#2ECC71' },
  badgeInactive: { backgroundColor: '#9CA3AF' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  departmentLabel: { marginTop: 10, color: '#9CA3AF', fontSize: 11, textTransform: 'uppercase' },
  departmentValue: { marginTop: 3, color: '#1F2937', fontWeight: '600' },
  cardActions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  editBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5
  },
  editBtnText: { color: '#3366CC', fontWeight: '700', fontSize: 12 },
  deleteBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5
  },
  deleteBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 12 },
  pager: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pagerBtn: { backgroundColor: '#003366', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  btnDisabled: { opacity: 0.5 },
  pagerText: { color: '#fff', fontWeight: '600' },
  pageText: { color: '#6B7280', fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 14 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, maxHeight: '96%', width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#003366', marginBottom: 10 },
  formWrap: { maxHeight: 680 },
  inputLabel: { color: '#374151', fontWeight: '600', marginTop: 8, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
    backgroundColor: '#fff'
  },
  inputError: { borderColor: '#F87171' },
  inputErrorBorder: { borderColor: '#F87171' },
  errorText: { color: '#DC2626', fontSize: 12, marginTop: 4 },
  pickerEmpty: { color: '#B45309', fontSize: 13, marginTop: 6 },
  intentTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  intentTriggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  intentTriggerDisabled: { opacity: 0.7 },
  intentTriggerText: { flex: 1, fontSize: 14, color: '#111827', fontWeight: '500' },
  intentTriggerPlaceholder: { color: '#9CA3AF', fontWeight: '400' },
  intentDropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#D1D5DB',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  intentDropdownScroll: { maxHeight: 260 },
  intentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  intentItemFirst: { borderTopWidth: 0 },
  intentCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: '#fff'
  },
  intentCheckboxChecked: { backgroundColor: '#3366CC', borderColor: '#3366CC' },
  intentCheckMark: { color: '#fff', fontWeight: '700', fontSize: 13 },
  intentItemText: { flex: 1, minWidth: 0 },
  intentTypeName: { fontWeight: '700', color: '#003366', fontSize: 14 },
  intentDesc: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10
  },
  cancelBtnText: { color: '#334155', fontWeight: '700' },
  submitBtn: {
    flex: 1,
    backgroundColor: '#3366CC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10
  },
  submitBtnText: { color: '#fff', fontWeight: '700' }
})
