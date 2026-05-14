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
import {
  ArrowLeft,
  ArrowLeftRight,
  CircleCheck,
  Clock,
  FileText,
  History,
  LayoutList,
  Plus,
  Search,
  Send,
  XCircle
} from 'lucide-react-native'
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

function staffInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase() || '?'
}

function claimTypeIcon(type: string) {
  const t = type.toLowerCase()
  if (t.includes('party') || t.includes('gửi') || t.includes('send')) return Send
  return FileText
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

  const onCreateClaimPress = () => {
    Toast.show({
      type: 'info',
      text1: 'Tạo yêu cầu',
      text2: 'Nhân viên tạo yêu cầu từ màn Claim trên ứng dụng nhân viên.'
    })
  }

  const renderKpi = () => {
    const specs = [
      {
        key: 'Tổng',
        val: dashboard?.total ?? '—',
        bg: '#1e3a5f',
        Icon: LayoutList
      },
      {
        key: 'Chờ',
        val: dashboard?.pending ?? '—',
        bg: '#ea580c',
        Icon: Clock
      },
      {
        key: 'Đã duyệt',
        val: dashboard?.approved ?? '—',
        bg: '#16a34a',
        Icon: CircleCheck
      },
      {
        key: 'Từ chối',
        val: dashboard?.rejected ?? '—',
        bg: '#dc2626',
        Icon: XCircle
      }
    ]
    return (
      <View style={styles.kpiRow}>
        {specs.map((x) => {
          const Icon = x.Icon
          return (
            <View key={x.key} style={[styles.kpiCard, { backgroundColor: x.bg }]}>
              <Icon size={14} color="#fff" strokeWidth={2} />
              <Text style={styles.kpiCardVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {x.val}
              </Text>
              <Text style={styles.kpiCardKey} numberOfLines={2}>
                {x.key}
              </Text>
            </View>
          )
        })}
      </View>
    )
  }

  const renderClaimCard = ({ item }: { item: ManagerClaimItem }) => {
    const TypeIcon = claimTypeIcon(item.type)
    const initials = staffInitials(item.staff)
    return (
      <Pressable style={styles.claimCard} onPress={() => setDetailClaim(item)}>
        <View style={styles.claimCardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.claimCardHeadMid}>
            <View style={styles.claimTypeRow}>
              <Text style={styles.claimWord}>Claim</Text>
              <TypeIcon size={14} color="#64748b" strokeWidth={2} />
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: statusBg(item.status) }]}>
            <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
          </View>
        </View>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.staff}
        </Text>
        <Text style={styles.cardTypeHint} numberOfLines={1}>
          {item.type}
        </Text>
        <Text style={styles.cardDate}>{formatDateTime(item.submitDate)}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description || item.reason || '—'}
        </Text>
      </Pressable>
    )
  }

  const renderTaskCard = ({ item }: { item: ManagerChangeTaskClaimItem }) => (
    <Pressable style={styles.claimCard} onPress={() => setDetailTask(item)}>
      <View style={styles.claimCardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{staffInitials(item.staffName)}</Text>
        </View>
        <View style={styles.claimCardHeadMid}>
          <View style={styles.claimTypeRow}>
            <Text style={styles.claimWord} numberOfLines={1}>
              {item.claimTypeName || 'Đổi task'}
            </Text>
            <ArrowLeftRight size={14} color="#64748b" strokeWidth={2} />
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: '#e0e7ff' }]}>
          <Text style={[styles.badgeText, { color: '#3730a3' }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardName} numberOfLines={1}>
        {item.staffName}
      </Text>
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

      {mainTab === 'claims' ? (
        <View style={styles.actionGrid}>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionPrimary} onPress={onCreateClaimPress}>
              <Plus size={18} color="#fff" strokeWidth={2.5} />
              <Text style={styles.actionPrimaryText}>Tạo Yêu cầu</Text>
            </Pressable>
            <Pressable style={styles.actionOutline} onPress={() => setMainTab('changeTasks')}>
              <ArrowLeftRight size={18} color="#2563eb" strokeWidth={2.2} />
              <Text style={styles.actionOutlineText}>Đổi task</Text>
            </Pressable>
          </View>
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.actionFilter, claimMode === 'pending' && styles.actionFilterOn]}
              onPress={() => {
                setMainTab('claims')
                setClaimMode('pending')
              }}
            >
              <Clock size={18} color={claimMode === 'pending' ? '#c2410c' : '#64748b'} strokeWidth={2.2} />
              <Text style={[styles.actionFilterText, claimMode === 'pending' && styles.actionFilterTextOn]}>Chờ duyệt</Text>
            </Pressable>
            <Pressable
              style={[styles.actionOutline, claimMode === 'history' && styles.actionOutlineOn]}
              onPress={() => {
                setMainTab('claims')
                setClaimMode('history')
              }}
            >
              <History size={18} color="#2563eb" strokeWidth={2.2} />
              <Text style={styles.actionOutlineText}>Lịch sử</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.ctTopBar}>
          <Pressable style={styles.ctBack} onPress={() => setMainTab('claims')} hitSlop={8}>
            <ArrowLeft size={20} color="#2563eb" strokeWidth={2.2} />
            <Text style={styles.ctBackText}>Yêu cầu</Text>
          </Pressable>
          <Text style={styles.ctTitle}>Đổi task</Text>
        </View>
      )}

      {mainTab === 'claims' ? (
        <View style={styles.claimsPane}>
          <View style={styles.searchWrap}>
            <Search size={18} color="#64748b" strokeWidth={2.2} />
            <TextInput
              placeholder="Lọc trong danh sách..."
              placeholderTextColor="#9ca3af"
              value={claimSearch}
              onChangeText={setClaimSearch}
              style={styles.searchInput}
            />
          </View>
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
              style={styles.listFlex}
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
        </View>
      ) : (
        <View style={styles.claimsPane}>
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
              style={styles.listFlex}
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
        </View>
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
              style={styles.searchModal}
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
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 2,
    gap: 6
  },
  kpiCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1
  },
  kpiCardVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    maxWidth: '100%'
  },
  kpiCardKey: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 11
  },
  actionGrid: { paddingHorizontal: 16, marginTop: 12, gap: 8 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12
  },
  actionPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  actionOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#93c5fd'
  },
  actionOutlineOn: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  actionOutlineText: { color: '#2563eb', fontWeight: '700', fontSize: 14 },
  actionFilter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff7ed',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa'
  },
  actionFilterOn: { backgroundColor: '#ffedd5', borderColor: '#fb923c' },
  actionFilterText: { color: '#64748b', fontWeight: '700', fontSize: 14 },
  actionFilterTextOn: { color: '#c2410c' },
  ctTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12
  },
  ctBack: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ctBackText: { color: '#2563eb', fontWeight: '600', fontSize: 15 },
  ctTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  claimsPane: { flex: 1, marginTop: 8 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    backgroundColor: '#fff'
  },
  searchInput: { flex: 1, fontSize: 15, color: '#0f172a', paddingVertical: 0 },
  searchModal: {
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#0f172a'
  },
  listFlex: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 },
  claimCard: {
    backgroundColor: '#faf6f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0e6d8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2
  },
  claimCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8e4df',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#57534e' },
  claimCardHeadMid: { flex: 1, marginLeft: 10, marginRight: 8 },
  claimTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  claimWord: { fontSize: 15, fontWeight: '700', color: '#334155' },
  cardName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardTypeHint: { fontSize: 12, color: '#78716c', marginTop: 2 },
  cardDate: { fontSize: 12, color: '#64748b', marginTop: 4 },
  cardDesc: { fontSize: 14, color: '#475569', marginTop: 8, lineHeight: 20 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
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
