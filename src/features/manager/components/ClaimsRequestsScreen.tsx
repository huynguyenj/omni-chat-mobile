import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { ClaimApi } from '../api/claim-api'
import { ManagerStaffApi } from '../api/manager-staff-api'
import type {
  ManagerChangeTaskClaimItem,
  ManagerClaimDashboardData,
  ManagerClaimItem,
  ManagerClaimStatus
} from '../types/claim-type'
import type { StaffDetailType } from '@/features/staff-manager/types/staff-type'
import {
  formatDateTime,
  normalizeChangeTaskClaim,
  normalizeClaim
} from '../utils/claimsNormalize'

const CLAIM_PAGE = 9
const CHANGE_TASK_PAGE = 10

type MainTab = 'claims' | 'changeTasks'
type ClaimMode = 'pending' | 'history'

function statusLabel(s: ManagerClaimStatus) {
  if (s === 'pending') return 'Chờ duyệt'
  if (s === 'approved') return 'Đã duyệt'
  return 'Từ chối'
}

function statusColor(s: ManagerClaimStatus) {
  if (s === 'pending') return '#b45309'
  if (s === 'approved') return '#15803d'
  return '#b91c1c'
}

function statusBg(s: ManagerClaimStatus) {
  if (s === 'pending') return '#fef3c7'
  if (s === 'approved') return '#dcfce7'
  return '#fee2e2'
}

export default function ClaimsRequestsScreen() {
  const [mainTab, setMainTab] = useState<MainTab>('claims')
  const [claimMode, setClaimMode] = useState<ClaimMode>('pending')

  const [dashboard, setDashboard] = useState<ManagerClaimDashboardData | null>(null)
  const [dashboardErr, setDashboardErr] = useState<string | null>(null)

  const [claimItems, setClaimItems] = useState<ManagerClaimItem[]>([])
  const [claimPage, setClaimPage] = useState(1)
  const [claimMeta, setClaimMeta] = useState({ total_pages: 1, current_page: 1 })
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimRefreshing, setClaimRefreshing] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [claimSearch, setClaimSearch] = useState('')

  const [ctItems, setCtItems] = useState<ManagerChangeTaskClaimItem[]>([])
  const [ctPage, setCtPage] = useState(1)
  const [ctMeta, setCtMeta] = useState({ total_pages: 1, current_page: 1 })
  const [ctLoading, setCtLoading] = useState(false)
  const [ctRefreshing, setCtRefreshing] = useState(false)
  const [ctError, setCtError] = useState<string | null>(null)

  const [detailClaim, setDetailClaim] = useState<ManagerClaimItem | null>(null)
  const [detailTask, setDetailTask] = useState<ManagerChangeTaskClaimItem | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [staffPickerOpen, setStaffPickerOpen] = useState(false)
  const [staffList, setStaffList] = useState<StaffDetailType[]>([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffSearch, setStaffSearch] = useState('')

  const loadDashboard = useCallback(async () => {
    setDashboardErr(null)
    try {
      const d = await ClaimApi.getDashboard()
      setDashboard(d)
    } catch {
      setDashboardErr('Không tải được thống kê.')
    }
  }, [])

  const fetchClaimsPage = useCallback(
    async (page: number, mode: ClaimMode) => {
      const res = mode === 'pending' ? await ClaimApi.getPendingClaims(page, CLAIM_PAGE) : await ClaimApi.getHistoryClaims(page, CLAIM_PAGE)
      const items = (res.items ?? []).map((raw) => normalizeClaim(raw, mode))
      const meta = res.meta ?? { total_pages: 1, total_items: 0, current_page: page, page_size: CLAIM_PAGE }
      return { items, meta }
    },
    []
  )

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    setClaimPage(1)
    setClaimItems([])
    setClaimLoading(true)
    let cancelled = false
    ;(async () => {
      setClaimError(null)
      try {
        const { items, meta } = await fetchClaimsPage(1, claimMode)
        if (cancelled) return
        setClaimMeta({ total_pages: meta.total_pages ?? 1, current_page: meta.current_page ?? 1 })
        setClaimItems(items)
        setClaimPage(1)
      } catch (e) {
        if (cancelled) return
        const msg = typeof e === 'string' ? e : 'Không tải được danh sách yêu cầu.'
        setClaimError(msg)
        Toast.show({ type: 'error', text1: msg })
      } finally {
        if (!cancelled) setClaimLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [claimMode, fetchClaimsPage])

  const fetchChangeTasks = useCallback(async (page: number) => {
    const res = await ClaimApi.getPendingChangeTaskClaims(page, CHANGE_TASK_PAGE)
    const items = (res.items ?? []).map((raw) => normalizeChangeTaskClaim(raw))
    const meta = res.meta ?? { total_pages: 1, total_items: 0, current_page: page, page_size: CHANGE_TASK_PAGE }
    return { items, meta }
  }, [])

  useEffect(() => {
    if (mainTab !== 'changeTasks') return
    setCtPage(1)
    setCtItems([])
    setCtLoading(true)
    let cancelled = false
    ;(async () => {
      setCtError(null)
      try {
        const { items, meta } = await fetchChangeTasks(1)
        if (cancelled) return
        setCtMeta({ total_pages: meta.total_pages ?? 1, current_page: meta.current_page ?? 1 })
        setCtItems(items)
        setCtPage(1)
      } catch (e) {
        if (cancelled) return
        const msg = typeof e === 'string' ? e : 'Không tải được đổi task.'
        setCtError(msg)
        Toast.show({ type: 'error', text1: msg })
      } finally {
        if (!cancelled) setCtLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mainTab, fetchChangeTasks])

  const filteredClaims = useMemo(() => {
    const q = claimSearch.trim().toLowerCase()
    if (!q) return claimItems
    return claimItems.filter(
      (c) =>
        c.staff.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.reason.toLowerCase().includes(q)
    )
  }, [claimItems, claimSearch])

  const onRefreshClaims = useCallback(async () => {
    setClaimRefreshing(true)
    setClaimError(null)
    try {
      const { items, meta } = await fetchClaimsPage(1, claimMode)
      setClaimMeta({ total_pages: meta.total_pages ?? 1, current_page: meta.current_page ?? 1 })
      setClaimItems(items)
      setClaimPage(1)
      await loadDashboard()
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Làm mới thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setClaimRefreshing(false)
    }
  }, [claimMode, fetchClaimsPage, loadDashboard])

  const onLoadMoreClaims = useCallback(async () => {
    if (claimLoading || claimRefreshing) return
    if (claimMeta.current_page >= claimMeta.total_pages) return
    const next = claimPage + 1
    setClaimLoading(true)
    try {
      const { items, meta } = await fetchClaimsPage(next, claimMode)
      setClaimMeta({ total_pages: meta.total_pages ?? 1, current_page: meta.current_page ?? next })
      setClaimItems((prev) => [...prev, ...items])
      setClaimPage(next)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Không tải thêm được.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setClaimLoading(false)
    }
  }, [claimLoading, claimRefreshing, claimMeta, claimPage, claimMode, fetchClaimsPage])

  const onRefreshChangeTasks = useCallback(async () => {
    setCtRefreshing(true)
    setCtError(null)
    try {
      const { items, meta } = await fetchChangeTasks(1)
      setCtMeta({ total_pages: meta.total_pages ?? 1, current_page: meta.current_page ?? 1 })
      setCtItems(items)
      setCtPage(1)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Làm mới thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setCtRefreshing(false)
    }
  }, [fetchChangeTasks])

  const onLoadMoreChangeTasks = useCallback(async () => {
    if (ctLoading || ctRefreshing) return
    if (ctMeta.current_page >= ctMeta.total_pages) return
    const next = ctPage + 1
    setCtLoading(true)
    try {
      const { items, meta } = await fetchChangeTasks(next)
      setCtMeta({ total_pages: meta.total_pages ?? 1, current_page: meta.current_page ?? next })
      setCtItems((prev) => [...prev, ...items])
      setCtPage(next)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Không tải thêm được.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setCtLoading(false)
    }
  }, [ctLoading, ctRefreshing, ctMeta, ctPage, fetchChangeTasks])

  const openStaffPicker = useCallback(async () => {
    setStaffPickerOpen(true)
    setStaffSearch('')
    setStaffLoading(true)
    try {
      const res = await ManagerStaffApi.getStaffs({ pageNumber: 1, pageSize: 80, descending: false })
      if (res.is_success === false || !res.data?.items) {
        setStaffList([])
        Toast.show({ type: 'error', text1: res.reason || 'Không tải được nhân viên.' })
        return
      }
      setStaffList(res.data.items)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Không tải được nhân viên.'
      Toast.show({ type: 'error', text1: msg })
      setStaffList([])
    } finally {
      setStaffLoading(false)
    }
  }, [])

  const filteredStaff = useMemo(() => {
    const q = staffSearch.trim().toLowerCase()
    if (!q) return staffList
    return staffList.filter((s) => `${s.name ?? ''} ${s.email ?? ''}`.toLowerCase().includes(q))
  }, [staffList, staffSearch])

  const handleApprove = async () => {
    if (!detailClaim?.id) return
    setActionLoading(true)
    try {
      await ClaimApi.approveClaim(detailClaim.id)
      Toast.show({ type: 'success', text1: 'Đã duyệt yêu cầu.' })
      setDetailClaim(null)
      await onRefreshClaims()
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Duyệt thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!detailClaim?.id) return
    setActionLoading(true)
    try {
      await ClaimApi.rejectClaim(detailClaim.id)
      Toast.show({ type: 'success', text1: 'Đã từ chối yêu cầu.' })
      setDetailClaim(null)
      await onRefreshClaims()
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Từ chối thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReassign = async (staff: StaffDetailType) => {
    if (!detailTask?.conversationId) {
      Toast.show({ type: 'error', text1: 'Thiếu conversationId (backend).' })
      return
    }
    setActionLoading(true)
    try {
      const message = await ClaimApi.reassignClaimConversation(detailTask.conversationId, staff.id)
      Toast.show({ type: 'success', text1: message })
      setStaffPickerOpen(false)
      setDetailTask(null)
      await onRefreshChangeTasks()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gán lại thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setActionLoading(false)
    }
  }

  const renderKpi = () => (
    <View style={styles.kpiRow}>
      {[
        { k: 'Tổng', v: dashboard?.total ?? '—' },
        { k: 'Chờ', v: dashboard?.pending ?? '—' },
        { k: 'Đã duyệt', v: dashboard?.approved ?? '—' },
        { k: 'Từ chối', v: dashboard?.rejected ?? '—' }
      ].map((x) => (
        <View key={x.k} style={styles.kpiCell}>
          <Text style={styles.kpiVal}>{x.v}</Text>
          <Text style={styles.kpiKey}>{x.k}</Text>
        </View>
      ))}
    </View>
  )

  const renderClaimCard = ({ item }: { item: ManagerClaimItem }) => (
    <Pressable style={styles.card} onPress={() => setDetailClaim(item)}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.type}
        </Text>
        <View style={[styles.badge, { backgroundColor: statusBg(item.status) }]}>
          <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
        </View>
      </View>
      <Text style={styles.cardMeta}>{item.staff}</Text>
      <Text style={styles.cardDate}>{formatDateTime(item.submitDate)}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.description}
      </Text>
    </Pressable>
  )

  const renderTaskCard = ({ item }: { item: ManagerChangeTaskClaimItem }) => (
    <Pressable style={styles.card} onPress={() => setDetailTask(item)}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.claimTypeName || 'Đổi task'}
        </Text>
        <View style={[styles.badge, { backgroundColor: '#e0e7ff' }]}>
          <Text style={[styles.badgeText, { color: '#3730a3' }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardMeta}>{item.staffName}</Text>
      <Text style={styles.cardDate}>{formatDateTime(item.submitDate)}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.description}
      </Text>
    </Pressable>
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Yêu cầu</Text>
      </View>

      {dashboardErr ? <Text style={styles.warn}>{dashboardErr}</Text> : null}
      {renderKpi()}

      <View style={styles.mainTabs}>
        <Pressable
          onPress={() => setMainTab('claims')}
          style={[styles.mainTab, mainTab === 'claims' && styles.mainTabOn]}
        >
          <Text style={[styles.mainTabText, mainTab === 'claims' && styles.mainTabTextOn]}>Yêu cầu</Text>
        </Pressable>
        <Pressable
          onPress={() => setMainTab('changeTasks')}
          style={[styles.mainTab, mainTab === 'changeTasks' && styles.mainTabOn]}
        >
          <Text style={[styles.mainTabText, mainTab === 'changeTasks' && styles.mainTabTextOn]}>Đổi task</Text>
        </Pressable>
      </View>

      {mainTab === 'claims' ? (
        <>
          <View style={styles.subTabs}>
            <Pressable
              onPress={() => setClaimMode('pending')}
              style={[styles.subTab, claimMode === 'pending' && styles.subTabOn]}
            >
              <Text style={[styles.subTabText, claimMode === 'pending' && styles.subTabTextOn]}>Chờ duyệt</Text>
            </Pressable>
            <Pressable
              onPress={() => setClaimMode('history')}
              style={[styles.subTab, claimMode === 'history' && styles.subTabOn]}
            >
              <Text style={[styles.subTabText, claimMode === 'history' && styles.subTabTextOn]}>Lịch sử</Text>
            </Pressable>
          </View>
          <TextInput
            placeholder="Lọc trong danh sách đã tải…"
            placeholderTextColor="#9ca3af"
            value={claimSearch}
            onChangeText={setClaimSearch}
            style={styles.search}
          />
          {claimError ? (
            <View style={styles.errBox}>
              <Text style={styles.errText}>{claimError}</Text>
              <Pressable style={styles.retry} onPress={onRefreshClaims}>
                <Text style={styles.retryText}>Thử lại</Text>
              </Pressable>
            </View>
          ) : null}
          {claimLoading && claimItems.length === 0 ? (
            <ActivityIndicator style={{ marginTop: 24 }} />
          ) : (
            <FlatList
              data={filteredClaims}
              keyExtractor={(c) => c.id}
              renderItem={renderClaimCard}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={claimRefreshing} onRefresh={onRefreshClaims} />}
              ListEmptyComponent={
                <Text style={styles.empty}>{claimSearch.trim() ? 'Không khớp bộ lọc.' : 'Không có yêu cầu.'}</Text>
              }
              onEndReached={onLoadMoreClaims}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                claimMeta.current_page < claimMeta.total_pages ? (
                  <View style={{ paddingVertical: 16 }}>
                    {claimLoading ? <ActivityIndicator /> : null}
                  </View>
                ) : null
              }
            />
          )}
        </>
      ) : (
        <>
          {ctError ? (
            <View style={styles.errBox}>
              <Text style={styles.errText}>{ctError}</Text>
              <Pressable style={styles.retry} onPress={onRefreshChangeTasks}>
                <Text style={styles.retryText}>Thử lại</Text>
              </Pressable>
            </View>
          ) : null}
          {ctLoading && ctItems.length === 0 ? (
            <ActivityIndicator style={{ marginTop: 24 }} />
          ) : (
            <FlatList
              data={ctItems}
              keyExtractor={(c) => c.id || c.conversationId}
              renderItem={renderTaskCard}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={ctRefreshing} onRefresh={onRefreshChangeTasks} />}
              ListEmptyComponent={<Text style={styles.empty}>Không có yêu cầu đổi task.</Text>}
              onEndReached={onLoadMoreChangeTasks}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                ctMeta.current_page < ctMeta.total_pages ? (
                  <View style={{ paddingVertical: 16 }}>{ctLoading ? <ActivityIndicator /> : null}</View>
                ) : null
              }
            />
          )}
        </>
      )}

      <Modal visible={!!detailClaim} animationType="slide" transparent onRequestClose={() => setDetailClaim(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setDetailClaim(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <ScrollView>
              <Text style={styles.modalTitle}>Chi tiết yêu cầu</Text>
              {detailClaim ? (
                <>
                  <Text style={styles.modalLabel}>Loại</Text>
                  <Text style={styles.modalValue}>{detailClaim.type}</Text>
                  <Text style={styles.modalLabel}>Nhân viên</Text>
                  <Text style={styles.modalValue}>{detailClaim.staff}</Text>
                  <Text style={styles.modalLabel}>Thời gian</Text>
                  <Text style={styles.modalValue}>{formatDateTime(detailClaim.submitDate)}</Text>
                  <Text style={styles.modalLabel}>Mô tả</Text>
                  <Text style={styles.modalValue}>{detailClaim.description}</Text>
                  <Text style={styles.modalLabel}>Lý do</Text>
                  <Text style={styles.modalValue}>{detailClaim.reason}</Text>
                  <Text style={styles.modalLabel}>Trạng thái</Text>
                  <Text style={styles.modalValue}>{statusLabel(detailClaim.status)}</Text>
                  {claimMode === 'pending' && detailClaim.status === 'pending' ? (
                    <View style={styles.actions}>
                      <Pressable
                        style={[styles.btn, styles.btnDanger]}
                        disabled={actionLoading}
                        onPress={handleReject}
                      >
                        <Text style={styles.btnDangerText}>Từ chối</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.btn, styles.btnPrimary]}
                        disabled={actionLoading}
                        onPress={handleApprove}
                      >
                        {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Duyệt</Text>}
                      </Pressable>
                    </View>
                  ) : null}
                </>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!detailTask} animationType="slide" transparent onRequestClose={() => setDetailTask(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setDetailTask(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <ScrollView>
              <Text style={styles.modalTitle}>Đổi task</Text>
              {detailTask ? (
                <>
                  <Text style={styles.modalLabel}>Nhân viên hiện tại</Text>
                  <Text style={styles.modalValue}>{detailTask.staffName}</Text>
                  <Text style={styles.modalLabel}>Conversation</Text>
                  <Text style={styles.modalValue}>{detailTask.conversationId || '—'}</Text>
                  <Text style={styles.modalLabel}>Mô tả</Text>
                  <Text style={styles.modalValue}>{detailTask.description}</Text>
                  <Text style={styles.modalLabel}>Lý do</Text>
                  <Text style={styles.modalValue}>{detailTask.reason}</Text>
                  {detailTask.staffIntentTypes?.length ? (
                    <>
                      <Text style={styles.modalLabel}>Intent gán</Text>
                      <Text style={styles.modalValue}>
                        {detailTask.staffIntentTypes.map((t) => t.intentTypeName).join(', ')}
                      </Text>
                    </>
                  ) : null}
                  <Pressable
                    style={[styles.btn, styles.btnPrimary, { marginTop: 16 }]}
                    onPress={openStaffPicker}
                    disabled={actionLoading || !detailTask.conversationId}
                  >
                    <Text style={styles.btnPrimaryText}>Gán lại nhân viên</Text>
                  </Pressable>
                </>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={staffPickerOpen} animationType="slide" transparent onRequestClose={() => setStaffPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setStaffPickerOpen(false)}>
          <Pressable style={[styles.modalCard, { maxHeight: '85%' }]} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Chọn nhân viên</Text>
            <TextInput
              placeholder="Tìm tên…"
              placeholderTextColor="#9ca3af"
              value={staffSearch}
              onChangeText={setStaffSearch}
              style={styles.search}
            />
            {staffLoading ? (
              <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : (
              <FlatList
                data={filteredStaff}
                keyExtractor={(s) => s.id}
                style={{ flexGrow: 0 }}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.staffRow}
                    disabled={actionLoading || item.id === detailTask?.staffId}
                    onPress={() => handleReassign(item)}
                  >
                    <Text style={styles.staffName}>{item.name}</Text>
                    <Text style={styles.staffSub}>{item.email}</Text>
                  </Pressable>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Không có nhân viên.</Text>}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  screenTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  warn: { color: '#b45309', paddingHorizontal: 16, fontSize: 13 },
  kpiRow: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  kpiCell: { flex: 1, alignItems: 'center' },
  kpiVal: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  kpiKey: { fontSize: 11, color: '#64748b', marginTop: 2 },
  mainTabs: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 8 },
  mainTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center'
  },
  mainTabOn: { backgroundColor: '#1e293b' },
  mainTabText: { fontWeight: '600', color: '#475569' },
  mainTabTextOn: { color: '#fff' },
  subTabs: { flexDirection: 'row', marginHorizontal: 16, marginTop: 10, gap: 8 },
  subTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center'
  },
  subTabOn: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  subTabText: { color: '#64748b', fontWeight: '500' },
  subTabTextOn: { color: '#2563eb' },
  search: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#0f172a'
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#0f172a', marginRight: 8 },
  cardMeta: { fontSize: 14, color: '#334155' },
  cardDate: { fontSize: 12, color: '#64748b', marginTop: 2 },
  cardDesc: { fontSize: 13, color: '#475569', marginTop: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 32, fontSize: 15 },
  errBox: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  errText: { color: '#991b1b', fontSize: 14 },
  retry: { marginTop: 8, alignSelf: 'flex-start' },
  retryText: { color: '#2563eb', fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%'
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  modalLabel: { fontSize: 12, color: '#64748b', marginTop: 10 },
  modalValue: { fontSize: 15, color: '#0f172a' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnDanger: { backgroundColor: '#fee2e2' },
  btnDangerText: { color: '#b91c1c', fontWeight: '700' },
  staffRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  staffName: { fontSize: 16, color: '#0f172a', fontWeight: '600' },
  staffSub: { fontSize: 13, color: '#64748b' }
})
