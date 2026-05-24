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
  ArrowLeftRight,
  ChevronLeft,
  CircleCheck,
  Clock,
  FileText,
  History,
  LayoutList,
  Search,
  Send,
  X,
  XCircle
} from 'lucide-react-native'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { ClaimApi } from '../api/claim-api'
import { ManagerStaffApi } from '../api/manager-staff-api'
import { fetchMergedClaimsPageSlice } from '../utils/claimsMerged'
import { enrichChangeTaskClaimsWithStaffIntents } from '../utils/changeTaskEnrich'
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
import {
  changeTaskStatusLabelVi,
  claimTypeLabelVi,
  intentTypeLabelVi
} from '../utils/manager-ui-labels'
import Input from '@/components/ui/inputs/Input'
import ManagerClaimItemSkeleton from './ui/ManagerClaimItemSkeleton'

const CLAIM_PAGE = 9
const CHANGE_TASK_PAGE = 10

type MainTab = 'claims' | 'changeTasks'
type ClaimMode = 'all' | 'pending' | 'history'

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

function changeTaskStatusUi(status: string): { label: string; color: string; bg: string } {
  const s = String(status ?? '').toLowerCase()
  if (s.includes('approve')) return { label: 'Đã duyệt', color: '#166534', bg: '#dcfce7' }
  if (s.includes('reject')) return { label: 'Đã từ chối', color: '#991b1b', bg: '#fee2e2' }
  return { label: 'Chờ duyệt', color: '#c2410c', bg: '#ffedd5' }
}

function IntentChips({ intents }: { intents: ManagerChangeTaskClaimItem['staffIntentTypes'] }) {
  if (!intents?.length) {
    return <Text style={styles.intentEmpty}>Chưa có loại intent cho nhân viên.</Text>
  }
  return (
    <View style={styles.intentChipRow}>
      {intents.map((intent) => (
        <View key={`${intent.id}-${intent.intentTypeName}`} style={styles.intentChip}>
          <Text style={styles.intentChipText}>{intentTypeLabelVi(intent.intentTypeName)}</Text>
        </View>
      ))}
    </View>
  )
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
  const [pickedStaff, setPickedStaff] = useState<StaffDetailType | null>(null)
  const [staffList, setStaffList] = useState<StaffDetailType[]>([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffSearch, setStaffSearch] = useState('')
  const [approvingReassign, setApprovingReassign] = useState(false)
  const [rejectingChangeTask, setRejectingChangeTask] = useState(false)

  const loadDashboard = useCallback(async () => {
    setDashboardErr(null)
    try {
      const d = await ClaimApi.getDashboard()
      setDashboard(d)
    } catch {
      setDashboardErr('Không tải được thống kê.')
    }
  }, [])

  const fetchClaimsPage = useCallback(async (page: number, mode: ClaimMode) => {
    if (mode === 'all') {
      const { items, total } = await fetchMergedClaimsPageSlice(page, CLAIM_PAGE)
      const totalPages = Math.max(1, Math.ceil(total / CLAIM_PAGE))
      return {
        items,
        meta: {
          total_pages: totalPages,
          total_items: total,
          current_page: page,
          page_size: CLAIM_PAGE
        }
      }
    }
    const res =
      mode === 'pending' ? await ClaimApi.getPendingClaims(page, CLAIM_PAGE) : await ClaimApi.getHistoryClaims(page, CLAIM_PAGE)
    const items = (res.items ?? []).map((raw) => normalizeClaim(raw, mode))
    const meta = res.meta ?? { total_pages: 1, total_items: 0, current_page: page, page_size: CLAIM_PAGE }
    return { items, meta }
  }, [])

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
    const normalized = (res.items ?? []).map((raw) => normalizeChangeTaskClaim(raw))
    const items = await enrichChangeTaskClaimsWithStaffIntents(normalized)
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

  const closeDetailTask = useCallback(() => {
    setDetailTask(null)
    setPickedStaff(null)
    setStaffPickerOpen(false)
  }, [])

  const handleConfirmReassign = async () => {
    if (!detailTask?.id || !detailTask.conversationId) {
      Toast.show({ type: 'error', text1: 'Thiếu claimId hoặc conversationId.' })
      return
    }
    if (!pickedStaff?.id) {
      Toast.show({ type: 'error', text1: 'Vui lòng chọn nhân viên mới trước khi duyệt.' })
      return
    }
    setApprovingReassign(true)
    try {
      const message = await ClaimApi.approveReassignClaim(
        detailTask.id,
        detailTask.conversationId,
        pickedStaff.id
      )
      Toast.show({ type: 'success', text1: message })
      closeDetailTask()
      await onRefreshChangeTasks()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Duyệt chuyển giao thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setApprovingReassign(false)
    }
  }

  const handleRejectChangeTask = async () => {
    if (!detailTask?.id) return
    const managerId = useAuthStore.getState().staffId ?? useAuthStore.getState().accountId ?? ''
    if (!managerId) {
      Toast.show({ type: 'error', text1: 'Không xác định được manager. Vui lòng đăng nhập lại.' })
      return
    }
    setRejectingChangeTask(true)
    try {
      const message = await ClaimApi.rejectChangeTaskClaim(detailTask.id, managerId)
      Toast.show({ type: 'success', text1: message })
      closeDetailTask()
      await onRefreshChangeTasks()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Từ chối yêu cầu thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setRejectingChangeTask(false)
    }
  }

  const changeTaskBusy = approvingReassign || rejectingChangeTask

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
              <View style={{ flexDirection: 'row', gap: 5 }}>
                <Icon size={14} color="#fff" strokeWidth={2} />
                <Text style={styles.kpiCardKey} numberOfLines={2}>
                  {x.key}
                </Text>
              </View>
              <Text style={styles.kpiCardVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {x.val}
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
              <Text style={styles.claimWord}>Yêu cầu</Text>
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
          {claimTypeLabelVi(item.type)}
        </Text>
        <Text style={styles.cardDate}>{formatDateTime(item.submitDate)}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description || item.reason || '—'}
        </Text>
      </Pressable>
    )
  }

  const renderTaskCard = ({ item }: { item: ManagerChangeTaskClaimItem }) => {
    const ctSt = changeTaskStatusUi(item.status)
    return (
    <Pressable
      style={styles.claimCard}
      onPress={() => {
        setPickedStaff(null)
        setDetailTask(item)
      }}
    >
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
        <View style={[styles.badge, { backgroundColor: ctSt.bg }]}>
          <Text style={[styles.badgeText, { color: ctSt.color }]}>{changeTaskStatusLabelVi(item.status)}</Text>
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
  }

  return (
    <View style={styles.safe}>
      {dashboardErr ? <Text style={styles.warn}>{dashboardErr}</Text> : null}
      {renderKpi()}

      <View style={styles.actionGrid}>
        <View style={styles.actionRow}>
          <Pressable
            style={mainTab === 'claims' ? styles.actionPrimary : styles.actionOutline}
            onPress={() => setMainTab('claims')}
          >
            <FileText size={18} color={mainTab === 'claims' ? '#fff' : '#000000'} strokeWidth={2.2} />
            <Text style={mainTab === 'claims' ? styles.actionPrimaryText : styles.actionOutlineText}>Yêu cầu</Text>
          </Pressable>
          <Pressable
            style={mainTab === 'changeTasks' ? styles.actionPrimary : styles.actionOutline}
            onPress={() => setMainTab('changeTasks')}
          >
            <ArrowLeftRight size={18} color={mainTab === 'changeTasks' ? '#fff' : '#000000'} strokeWidth={2.2} />
            <Text style={mainTab === 'changeTasks' ? styles.actionPrimaryText : styles.actionOutlineText}>Đổi task</Text>
          </Pressable>
        </View>
        {mainTab === 'claims' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: 500}}>
            <Pressable
              style={[styles.actionOutline, claimMode === 'all' && styles.actionOutlineOn, { marginRight: 5, paddingHorizontal: 8 }]}
              onPress={() => setClaimMode('all')}
            >
              <LayoutList size={18} color={claimMode === 'all' ? '#2563eb' : '#000000'} strokeWidth={2.2} />
              <Text style={[styles.actionOutlineText, claimMode === 'all' && { color: '#2563eb' }]}>Tất cả</Text>
            </Pressable>
            <Pressable
              style={[styles.actionFilter, claimMode === 'pending' && styles.actionOutlineOn, { marginRight: 5, paddingHorizontal: 8 }]}
              onPress={() => setClaimMode('pending')}
            >
              <Clock size={18} color={claimMode === 'pending' ? '#2563eb' : '#000000'} strokeWidth={2.2} />
              <Text style={[styles.actionFilterText, claimMode === 'pending' && { color: '#2563eb' }]}>Chờ duyệt</Text>
            </Pressable>
            <Pressable
              style={[styles.actionOutline, claimMode === 'history' && styles.actionOutlineOn, { marginRight: 5, paddingHorizontal: 8 }]}
              onPress={() => setClaimMode('history')}
            >
              <History size={18} color={claimMode === 'history' ? '#2563eb' : '#000000'} strokeWidth={2.2} />
              <Text style={[styles.actionOutlineText, claimMode === 'history' && { color: '#2563eb' }]}>Lịch sử</Text>
            </Pressable>
          </ScrollView>
        ) : null}
      </View>

      {mainTab === 'claims' ? (
        <View style={styles.claimsPane}>
          <View style={styles.searchWrap}>
            <Input
              icon={{ iconName: Search, iconDirection: 'left' }}
              placeholder="Lọc trong danh sách..."
              placeholderTextColor="#9ca3af"
              value={claimSearch}
              onChangeText={setClaimSearch}
              style={{ height: 50}}
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
            Array.from({ length: 6 }).map((_, index) => (
            <ManagerClaimItemSkeleton key={index} />
          ))
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
                  <Text style={styles.modalValue}>{claimTypeLabelVi(detailClaim.type)}</Text>
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

      <Modal visible={!!detailTask} animationType="slide" transparent onRequestClose={closeDetailTask}>
        <Pressable style={styles.modalBackdrop} onPress={closeDetailTask}>
          <Pressable style={styles.ctModalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.ctModalHeader}>
              <Text style={styles.ctModalTitle}>Chi tiết yêu cầu đổi task</Text>
              <Pressable style={styles.ctCloseBtn} onPress={closeDetailTask} hitSlop={12}>
                <X size={18} color="#003366" strokeWidth={2.2} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.ctModalScroll}>
              {detailTask ? (
                <>
                  <View style={styles.ctHeroRow}>
                    <View style={styles.ctHeroLeft}>
                      <Text style={styles.ctStaffName}>{detailTask.staffName || 'Chưa rõ'}</Text>
                      <Text style={styles.ctClaimType}>{detailTask.claimTypeName || 'Đổi task'}</Text>
                      <Text style={styles.ctIntentLabel}>LOẠI INTENT (NHÂN VIÊN)</Text>
                      <IntentChips intents={detailTask.staffIntentTypes} />
                    </View>
                    {(() => {
                      const st = changeTaskStatusUi(detailTask.status)
                      return (
                        <View style={[styles.ctStatusBadge, { backgroundColor: st.bg }]}>
                          <Text style={[styles.ctStatusBadgeText, { color: st.color }]}>{st.label}</Text>
                        </View>
                      )
                    })()}
                  </View>

                  <View style={styles.ctGrid}>
                    <View style={styles.ctInfoBox}>
                      <Text style={styles.ctInfoLabel}>Ngày gửi</Text>
                      <Text style={styles.ctInfoValue}>{formatDateTime(detailTask.submitDate)}</Text>
                    </View>
                    <View style={styles.ctInfoBox}>
                      <Text style={styles.ctInfoLabel}>Trạng thái</Text>
                      <Text style={styles.ctInfoValue}>{changeTaskStatusLabelVi(detailTask.status)}</Text>
                    </View>
                  </View>

                  <View style={styles.ctInfoBoxFull}>
                    <Text style={styles.ctInfoLabelUpper}>MÔ TẢ</Text>
                    <Text style={styles.ctInfoValue}>{detailTask.description || '—'}</Text>
                  </View>

                  <View style={styles.ctInfoBoxFull}>
                    <Text style={styles.ctInfoLabelUpper}>LÝ DO</Text>
                    <Text style={styles.ctInfoValue}>{detailTask.reason || '—'}</Text>
                  </View>

                  <View style={styles.ctReassignCard}>
                    <View style={styles.ctReassignHead}>
                      <Text style={styles.ctReassignHeadText}>THAY NHÂN VIÊN</Text>
                    </View>
                    <View style={styles.ctReassignBody}>
                      {pickedStaff ? (
                        <Text style={styles.ctPickedStaff}>
                          {pickedStaff.name}
                          {pickedStaff.phone ? ` · ${pickedStaff.phone}` : ''}
                          {pickedStaff.email ? ` · ${pickedStaff.email}` : ''}
                        </Text>
                      ) : (
                        <Text style={styles.ctPickedHint}>Chưa chọn nhân viên mới.</Text>
                      )}
                      <Pressable
                        style={[styles.ctBtnAmber, changeTaskBusy && styles.btnDisabled]}
                        disabled={changeTaskBusy}
                        onPress={openStaffPicker}
                      >
                        <Text style={styles.ctBtnAmberText}>Chọn nhân viên mới</Text>
                      </Pressable>
                      {pickedStaff ? (
                        <Pressable
                          style={[styles.ctBtnApprove, changeTaskBusy && styles.btnDisabled]}
                          disabled={changeTaskBusy}
                          onPress={handleConfirmReassign}
                        >
                          {approvingReassign ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={styles.ctBtnApproveText}>Duyệt chuyển giao</Text>
                          )}
                        </Pressable>
                      ) : null}
                      <Pressable
                        style={[styles.ctBtnReject, changeTaskBusy && styles.btnDisabled]}
                        disabled={changeTaskBusy}
                        onPress={handleRejectChangeTask}
                      >
                        {rejectingChangeTask ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.ctBtnRejectText}>Từ chối</Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                </>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={staffPickerOpen} animationType="slide" transparent onRequestClose={() => setStaffPickerOpen(false)}>
        <View style={styles.spBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setStaffPickerOpen(false)} />
          <View style={styles.spSheet}>
            <View style={styles.spHeader}>
              <Pressable style={styles.spBackBtn} onPress={() => setStaffPickerOpen(false)} hitSlop={12}>
                <ChevronLeft size={22} color="#2563eb" strokeWidth={2.5} />
              </Pressable>
              <Text style={styles.spTitle}>Chọn nhân viên</Text>
            </View>

            <View style={styles.spSearchWrap}>
              <Search size={18} color="#9ca3af" strokeWidth={2} />
              <TextInput
                placeholder="Tìm tên nhân viên..."
                placeholderTextColor="#9ca3af"
                value={staffSearch}
                onChangeText={setStaffSearch}
                style={styles.spSearchInput}
              />
            </View>

            {staffLoading ? (
              <ActivityIndicator style={styles.spLoader} color="#2563eb" />
            ) : (
              <View style={styles.spListCard}>
                <FlatList
                  data={filteredStaff}
                  keyExtractor={(s) => s.id}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => {
                    const isCurrent = item.id === detailTask?.staffId
                    const isSelected = pickedStaff?.id === item.id
                    return (
                      <Pressable
                        style={[styles.spRow, isCurrent && styles.spRowDisabled]}
                        disabled={changeTaskBusy || isCurrent}
                        onPress={() => {
                          setPickedStaff(item)
                          setStaffPickerOpen(false)
                        }}
                      >
                        <View style={styles.spRowText}>
                          <Text style={styles.spName}>{item.name || '—'}</Text>
                          <Text style={styles.spEmail}>{item.email || '—'}</Text>
                        </View>
                        <View
                          style={[
                            styles.spRadio,
                            isSelected && styles.spRadioSelected,
                            isCurrent && styles.spRadioDisabled
                          ]}
                        >
                          {isSelected ? <View style={styles.spRadioDot} /> : null}
                        </View>
                      </Pressable>
                    )
                  }}
                  ItemSeparatorComponent={() => <View style={styles.spDivider} />}
                  ListEmptyComponent={<Text style={styles.spEmpty}>Không có nhân viên.</Text>}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
    minWidth: 0,
    width: '24%',
    borderRadius: 10,
    paddingVertical: 15,
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
  actionRow: { flexDirection: 'row', gap: 10 },
  actionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#003366',
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
    borderWidth: 1,
    borderColor: '#003366'
  },
  actionOutlineOn: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  actionOutlineText: { color: '#000000', fontWeight: '700', fontSize: 14 },
  actionFilter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionFilterOn: { backgroundColor: '#ffedd5', borderColor: '#fb923c' },
  actionFilterText: { color: '#000000', fontWeight: '700', fontSize: 14 },
  actionFilterTextOn: { color: '#c2410c' },
  claimsPane: { flex: 1, marginTop: 8 },
  searchWrap: {
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#0f172a', paddingVertical: 0 },
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
  spBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end'
  },
  spSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '92%',
    minHeight: '72%',
    paddingHorizontal: 16,
    paddingBottom: 20
  },
  spHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 14,
    paddingBottom: 12
  },
  spBackBtn: { padding: 4 },
  spTitle: { fontSize: 18, fontWeight: '700', color: '#003366' },
  spSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12
  },
  spSearchInput: { flex: 1, fontSize: 15, color: '#0f172a', paddingVertical: 0 },
  spLoader: { marginVertical: 24 },
  spListCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  spRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12
  },
  spRowDisabled: { opacity: 0.45 },
  spRowText: { flex: 1, minWidth: 0 },
  spName: { fontSize: 16, fontWeight: '700', color: '#003366' },
  spEmail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  spRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spRadioSelected: { borderColor: '#2563eb' },
  spRadioDisabled: { borderColor: '#cbd5e1' },
  spRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb'
  },
  spDivider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 14 },
  spEmpty: { textAlign: 'center', color: '#64748b', padding: 24, fontSize: 14 },
  ctModalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '92%',
    overflow: 'hidden'
  },
  ctModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  ctModalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#003366' },
  ctCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctModalScroll: { padding: 20, paddingBottom: 28 },
  ctHeroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  ctHeroLeft: { flex: 1, minWidth: 0 },
  ctStaffName: { fontSize: 18, fontWeight: '800', color: '#3366CC' },
  ctClaimType: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  ctIntentLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.5,
    marginTop: 10,
    textTransform: 'uppercase'
  },
  intentEmpty: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  intentChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  intentChip: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  intentChipText: { fontSize: 10, fontWeight: '700', color: '#374151' },
  ctStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  ctStatusBadgeText: { fontSize: 11, fontWeight: '800' },
  ctGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  ctInfoBox: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    padding: 12,
    minWidth: 0
  },
  ctInfoBoxFull: {
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  ctInfoLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  ctInfoLabelUpper: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  ctInfoValue: { fontSize: 14, fontWeight: '600', color: '#003366' },
  ctReassignCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fcd34d',
    overflow: 'hidden',
    marginTop: 4
  },
  ctReassignHead: { backgroundColor: '#d97706', paddingVertical: 10, paddingHorizontal: 14 },
  ctReassignHeadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  ctReassignBody: {
    backgroundColor: '#fffbeb',
    padding: 14,
    gap: 10
  },
  ctPickedStaff: { fontSize: 14, color: '#1f2937', lineHeight: 20 },
  ctPickedHint: { fontSize: 12, color: '#6b7280' },
  ctBtnAmber: {
    backgroundColor: '#d97706',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  ctBtnAmberText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  ctBtnApprove: {
    backgroundColor: '#6FDFA0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  ctBtnApproveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  ctBtnReject: {
    backgroundColor: '#F87171',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  ctBtnRejectText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnDisabled: { opacity: 0.6 }
})
