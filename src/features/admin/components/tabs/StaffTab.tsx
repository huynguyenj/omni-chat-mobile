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
import { Picker } from '@react-native-picker/picker'
import { Edit3, Plus, Shield, Trash2 } from 'lucide-react-native'
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

function IntentTypeChecklist({
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
  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id])
  }

  if (loading) {
    return <Text style={checklistStyles.hint}>Đang tải danh sách loại chức năng...</Text>
  }
  if (intentTypes.length === 0) {
    return <Text style={checklistStyles.warn}>Chưa có dữ liệu loại chức năng. Thử tải lại trang.</Text>
  }

  return (
    <View style={checklistStyles.wrap}>
      <View style={checklistStyles.titleRow}>
        <Shield size={16} color="#3366CC" />
        <View style={checklistStyles.titleTextWrap}>
          <Text style={checklistStyles.title}>Loại chức năng</Text>
          <Text style={checklistStyles.subtitle}>Chọn một hoặc nhiều; hệ thống gửi UUID tương ứng.</Text>
        </View>
      </View>
      {intentTypes.map((it) => {
        const checked = selectedIds.includes(it.id)
        return (
          <TouchableOpacity key={it.id} style={checklistStyles.item} onPress={() => toggle(it.id)}>
            <View style={[checklistStyles.checkbox, checked && checklistStyles.checkboxChecked]}>
              {checked ? <Text style={checklistStyles.checkMark}>✓</Text> : null}
            </View>
            <View style={checklistStyles.itemText}>
              <Text style={checklistStyles.typeName}>{it.typeName}</Text>
              {it.description ? <Text style={checklistStyles.desc}>{it.description}</Text> : null}
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const checklistStyles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#F8FAFC',
    marginTop: 8
  },
  titleRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  titleTextWrap: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: '#003366' },
  subtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  checkboxChecked: { backgroundColor: '#3366CC', borderColor: '#3366CC' },
  checkMark: { color: '#fff', fontWeight: '700', fontSize: 12 },
  itemText: { flex: 1 },
  typeName: { fontWeight: '700', color: '#111827', fontSize: 13 },
  desc: { color: '#6B7280', fontSize: 11, marginTop: 2 },
  hint: { color: '#6B7280', fontSize: 13, marginTop: 8 },
  warn: { color: '#B45309', fontSize: 13, marginTop: 8 }
})

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
      const response = await StaffApi.getStaffs(1, 200)
      setApiStaffs(extractArrayFromResponse(response) as StaffItem[])
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
      uiRole: staff.staffIntentTypes.length > 0 ? 'Staff' : 'Manager',
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
      .filter((it) => staff.staffIntentTypes.some((s) => s.intentTypeName === it.typeName))
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
    setModalMode('edit')
    setSelectedStaff(staff)
    setForm({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      roleId: '',
      intentTypeIds: mapStaffToIntentIds(staff, intentTypes)
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

              {modalMode === 'create' && (
                <>
                  <Text style={styles.inputLabel}>Vai trò</Text>
                  <View style={[styles.pickerWrap, formErrors.role && styles.inputErrorBorder]}>
                    {rolesLoading ? (
                      <ActivityIndicator color="#3366CC" />
                    ) : (
                      <Picker
                        selectedValue={form.roleId}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, roleId: String(value) }))}
                      >
                        <Picker.Item label="-- Chọn vai trò --" value="" />
                        {roles.map((role) => (
                          <Picker.Item key={role.id} label={role.name} value={role.id} />
                        ))}
                      </Picker>
                    )}
                  </View>
                  {formErrors.role ? <Text style={styles.errorText}>{formErrors.role}</Text> : null}
                </>
              )}

              <IntentTypeChecklist
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, maxHeight: '86%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#003366', marginBottom: 10 },
  formWrap: { maxHeight: 420 },
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
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
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
