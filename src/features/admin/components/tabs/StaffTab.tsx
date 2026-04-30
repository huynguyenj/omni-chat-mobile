import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { Edit3, Plus, Trash2, Users } from 'lucide-react-native'
import Card from '@/components/ui/cards/Card'
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
  intentId: string
}

const EMPTY_FORM: StaffFormState = {
  name: '',
  email: '',
  phone: '',
  roleId: '',
  intentId: ''
}

function parseIntentIds(raw: string) {
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .map((intentId) => ({ intentId }))
}

export default function StaffTab() {
  const STAFFS_PER_PAGE = 8

  const [loading, setLoading] = useState(false)
  const [apiStaffs, setApiStaffs] = useState<StaffItem[]>([])
  const [staffPage, setStaffPage] = useState(1)

  const [roles, setRoles] = useState<RoleItem[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)

  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<StaffModalMode>('create')
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null)
  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchStaffs = async () => {
    setLoading(true)
    try {
      const response = await StaffApi.getStaffs(1, 200)
      setApiStaffs(extractArrayFromResponse(response) as StaffItem[])
    } catch {
      notifyError('Khong tai duoc danh sach staff.')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    setRolesLoading(true)
    try {
      const list = await RolesApi.getRoles()
      setRoles(list)
    } catch {
      setRoles([])
      notifyError('Không tải được danh sách role.')
    } finally {
      setRolesLoading(false)
    }
  }

  useEffect(() => {
    void fetchStaffs()
    void fetchRoles()
  }, [])

  const uiStaffs = useMemo(() => {
    return apiStaffs.map((staff) => ({
      ...staff,
      uiRole: staff.staffIntentTypes.length > 0 ? 'Staff' : 'Manager',
      department:
        staff.staffIntentTypes.length > 0
          ? staff.staffIntentTypes.map((i) => i.intentTypeName).join(', ')
          : 'Chua phan loai',
      statusLabel: staff.status.toLowerCase() === 'online' ? 'Hoạt động' : 'Nghỉ'
    }))
  }, [apiStaffs])

  const totalStaffPages = Math.max(1, Math.ceil(uiStaffs.length / STAFFS_PER_PAGE))
  const effectiveStaffPage = Math.min(staffPage, totalStaffPages)
  const paginatedStaffs = useMemo(() => {
    const start = (effectiveStaffPage - 1) * STAFFS_PER_PAGE
    return uiStaffs.slice(start, start + STAFFS_PER_PAGE)
  }, [uiStaffs, effectiveStaffPage])

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedStaff(null)
    setForm(EMPTY_FORM)
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
      intentId: staff.staffIntentTypes?.map((i) => i.intentTypeName).join(',') ?? ''
    })
    setModalVisible(true)
  }

  const closeModal = () => {
    if (submitting) return
    setModalVisible(false)
  }

  const submitForm = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      notifyInfo('Vui lòng nhập đầy đủ tên, email, số điện thoại.')
      return
    }

    if (modalMode === 'create' && !form.roleId.trim()) {
      notifyInfo('Vui lòng chọn role khi tạo mới.')
      return
    }

    setSubmitting(true)
    try {
      if (modalMode === 'create') {
        await StaffApi.createStaff({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          roleId: form.roleId,
          staffIntentTypes: parseIntentIds(form.intentId)
        })
        notifySuccess('Thêm tài khoản thành công')
      } else if (selectedStaff) {
        await StaffApi.updateStaff(selectedStaff.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          staffIntentTypes: parseIntentIds(form.intentId)
        })
        notifySuccess('Cập nhật tài khoản thành công')
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
                    {staff.phone || '-'}
                  </Text>
                </View>
              </View>

              <View style={styles.badgesRow}>
                <View style={[styles.badge, staff.uiRole === 'Manager' ? styles.badgeManager : styles.badgeStaff]}>
                  <Text style={styles.badgeText}>{staff.uiRole}</Text>
                </View>
                <View style={[styles.badge, staff.statusLabel === 'Hoạt động' ? styles.badgeActive : styles.badgeInactive]}>
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
                <TouchableOpacity style={styles.deleteBtn} onPress={() => void handleDeleteStaff(staff.id)}>
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
        <Text style={styles.pageText}>Trang {effectiveStaffPage}/{totalStaffPages}</Text>
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
            <Text style={styles.modalTitle}>{modalMode === 'create' ? 'Thêm tài khoản mới' : 'Sửa tài khoản'}</Text>

            <ScrollView style={styles.formWrap}>
              <Text style={styles.inputLabel}>Họ và tên</Text>
              <TextInput
                value={form.name}
                onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
                style={styles.input}
                placeholder="Nhập họ và tên"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={form.email}
                onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
                style={styles.input}
                placeholder="example@omnichat.com"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                value={form.phone}
                onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
                style={styles.input}
                placeholder="Nhập số điện thoại"
              />

              {modalMode === 'create' && (
                <>
                  <Text style={styles.inputLabel}>Role</Text>
                  <View style={styles.pickerWrap}>
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
                </>
              )}

              <Text style={styles.inputLabel}>Intent ID(s) (ID của các intent)</Text>
              <TextInput
                value={form.intentId}
                onChangeText={(value) => setForm((prev) => ({ ...prev, intentId: value }))}
                style={styles.input}
                placeholder="id1,id2,id3 (ID của các intent)"
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
                <Text style={styles.submitBtnText}>{submitting ? 'Đang lưu...' : modalMode === 'create' ? 'Tạo' : 'Lưu'}</Text>
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
