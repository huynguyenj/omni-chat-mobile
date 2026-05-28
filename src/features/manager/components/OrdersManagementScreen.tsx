import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
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
  CreditCard,
  FileText,
  List,
  MapPin,
  RotateCcw,
  Search,
  Smartphone,
  Tag,
  User
} from 'lucide-react-native'
import { ManagerOrderApi } from '../api/manager-order-api'
import { ManagerPostSaleRequestApi } from '../api/manager-post-sale-request-api'
import { logRefund, logRefundError } from '../utils/refund-log'
import { postSaleRequestStatusLabelVi, postSaleTypeLabelVi } from '../utils/manager-ui-labels'
import type { ManagerOrderDetail, ManagerOrderItem } from '../types/manager-order-type'
import type { ManagerPostSaleRequestItem } from '../types/manager-post-sale-request-type'
import { formatDateTime } from '../utils/claimsNormalize'
import { MANAGER_ORDER_STATUS_FILTERS } from '../const/order-status'
import type { ManagerOrderStatusFilter } from '../const/order-status'
import {
  canCancelOrder,
  canSubmitDraftOrder,
  deliveryStatusPill,
  orderStatusPill
} from '../utils/managerOrdersNormalize'
import Input from '@/components/ui/inputs/Input'
import ManagerOrderCardSkeletonV2 from './ui/ManagerOrderItemSkeletonV2'
import ManagerPostSaleItemSkeleton from './ui/ManagerPostSaleItemSkeleton'

const ORDER_PAGE = 6
const PSR_PAGE = 9

type MainTab = 'orders' | 'refund'
type PostSaleFilterStatus = 'all' | 'Pending' | 'Approved' | 'Rejected'

const PSR_STATUS_FILTERS: Array<{ value: PostSaleFilterStatus; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Pending', label: 'Chờ duyệt' },
  { value: 'Approved', label: 'Đã duyệt' },
  { value: 'Rejected', label: 'Đã từ chối' }
]

function postSaleStatusPill(status: string): { label: string; bg: string; color: string } {
  const s = status.toLowerCase()
  if (s.includes('pending')) return { label: 'Chờ duyệt', bg: '#f59e0b', color: '#fff' }
  if (s.includes('approve')) return { label: 'Đã duyệt', bg: '#16a34a', color: '#fff' }
  if (s.includes('reject')) return { label: 'Đã từ chối', bg: '#dc2626', color: '#fff' }
  return { label: postSaleRequestStatusLabelVi(status), bg: '#64748b', color: '#fff' }
}

function postSaleTypePill(type: string): { label: string; bg: string; color: string } {
  const t = type.trim().toLowerCase()
  if (t === 'refund') return { label: 'Hoàn tiền', bg: '#2563eb', color: '#fff' }
  if (t === 'return') return { label: 'Trả hàng', bg: '#7c3aed', color: '#fff' }
  if (t === 'cancel') return { label: 'Hủy đơn', bg: '#64748b', color: '#fff' }
  if (t === 'replacement') return { label: 'Đổi hàng', bg: '#0ea5e9', color: '#fff' }
  return { label: postSaleTypeLabelVi(type), bg: '#64748b', color: '#fff' }
}

function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase() || '?'
}

type IconCmp = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>

function DetailField({
  Icon,
  label,
  value,
  emphasis
}: {
  Icon: IconCmp
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <View style={styles.detailField}>
      <View style={styles.detailIconCircle}>
        <Icon size={16} color="#64748b" strokeWidth={2} />
      </View>
      <View style={styles.detailFieldBody}>
        <Text style={styles.detailFieldLabel}>{label}</Text>
        <Text style={[styles.detailFieldValue, emphasis && styles.detailFieldEmphasis]}>{value}</Text>
      </View>
    </View>
  )
}

export default function OrdersManagementScreen() {
  const [mainTab, setMainTab] = useState<MainTab>('orders')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ManagerOrderStatusFilter>('all')
  const [psrStatusFilter, setPsrStatusFilter] = useState<PostSaleFilterStatus>('all')
  const [psrActionId, setPsrActionId] = useState<string | null>(null)

  const [items, setItems] = useState<ManagerOrderItem[]>([])
  const [meta, setMeta] = useState({ total_pages: 1, current_page: 1 })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const [detailId, setDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ManagerOrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [fromPostSaleList, setFromPostSaleList] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [psrItems, setPsrItems] = useState<ManagerPostSaleRequestItem[]>([])
  const [psrMeta, setPsrMeta] = useState({ total_pages: 1, current_page: 1 })
  const [psrLoading, setPsrLoading] = useState(false)
  const [psrLoadingMore, setPsrLoadingMore] = useState(false)
  const [psrRefreshing, setPsrRefreshing] = useState(false)
  const [psrError, setPsrError] = useState<string | null>(null)
  const [psrRefreshKey, setPsrRefreshKey] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 450)
    return () => clearTimeout(t)
  }, [search])

  const orderStatusesParam = useMemo(
    () => (statusFilter === 'all' ? undefined : [statusFilter]),
    [statusFilter]
  )

  const filteredPsrItems = useMemo(() => {
    const list =
      psrStatusFilter === 'all' ? psrItems : psrItems.filter((r) => String(r.status) === psrStatusFilter)
    logRefund('UI filter PSR', {
      statusFilter: psrStatusFilter,
      before: psrItems.length,
      after: list.length
    })
    return list
  }, [psrItems, psrStatusFilter])

  const fetchOrdersPage = useCallback(
    async (pageNumber: number, reset: boolean) => {
      const res = await ManagerOrderApi.getOrders({
        pageNumber,
        pageSize: ORDER_PAGE,
        search: debouncedSearch || undefined,
        orderStatuses: orderStatusesParam,
        sortBy: 'orderdate',
        descending: true
      })
      const m = res.meta
      setMeta({ total_pages: m.total_pages ?? 1, current_page: m.current_page ?? pageNumber })
      setItems((prev) => (reset ? res.items : [...prev, ...res.items]))
    },
    [debouncedSearch, orderStatusesParam]
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setListError(null)
    setItems([])
    ;(async () => {
      try {
        await fetchOrdersPage(1, true)
      } catch (e) {
        if (!cancelled) {
          const msg = typeof e === 'string' ? e : 'Không tải được đơn hàng.'
          setListError(msg)
          Toast.show({ type: 'error', text1: msg })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fetchOrdersPage])

  const fetchPsrPage = useCallback(async (pageNumber: number, reset: boolean) => {
    logRefund('UI fetchPsrPage →', { pageNumber, pageSize: PSR_PAGE, reset, statusFilter: psrStatusFilter })
    try {
      const res = await ManagerPostSaleRequestApi.getRequests(pageNumber, PSR_PAGE)
      const m = res.meta
      setPsrMeta({ total_pages: m.total_pages ?? 1, current_page: m.current_page ?? pageNumber })
      setPsrItems((prev) => {
        const next = reset ? res.items : [...prev, ...res.items]
        logRefund('UI fetchPsrPage ←', {
          received: res.items.length,
          totalInState: next.length,
          meta: m,
          statusFilter: psrStatusFilter
        })
        return next
      })
    } catch (error) {
      logRefundError('UI fetchPsrPage failed', error)
      throw error
    }
  }, [])

  useEffect(() => {
    if (mainTab !== 'refund') return
    let cancelled = false
    setPsrLoading(true)
    setPsrError(null)
    ;(async () => {
      try {
        await fetchPsrPage(1, true)
      } catch (e) {
        if (!cancelled) {
          const msg = typeof e === 'string' ? e : 'Không tải yêu cầu hoàn tiền.'
          setPsrError(msg)
        }
      } finally {
        if (!cancelled) setPsrLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mainTab, fetchPsrPage, psrRefreshKey])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setListError(null)
    try {
      await fetchOrdersPage(1, true)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Làm mới thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setRefreshing(false)
    }
  }, [fetchOrdersPage])

  const onRefreshPsr = useCallback(async () => {
    setPsrRefreshing(true)
    setPsrError(null)
    try {
      await fetchPsrPage(1, true)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Làm mới thất bại.'
      setPsrError(msg)
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setPsrRefreshing(false)
    }
  }, [fetchPsrPage])

  const onLoadMore = useCallback(async () => {
    if (loading || loadingMore || refreshing) return
    if (meta.current_page >= meta.total_pages) return
    const next = meta.current_page + 1
    setLoadingMore(true)
    try {
      await fetchOrdersPage(next, false)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Không tải thêm đơn.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setLoadingMore(false)
    }
  }, [loading, loadingMore, refreshing, meta, fetchOrdersPage])

  const onLoadMorePsr = useCallback(async () => {
    if (psrLoading || psrLoadingMore) return
    if (psrMeta.current_page >= psrMeta.total_pages) return
    const next = psrMeta.current_page + 1
    setPsrLoadingMore(true)
    try {
      await fetchPsrPage(next, false)
    } catch {
      /* ignore */
    } finally {
      setPsrLoadingMore(false)
    }
  }, [psrLoading, psrLoadingMore, psrMeta, fetchPsrPage])

  const selectStatus = (v: 'all' | ManagerOrderStatusFilter) => {
    setStatusFilter(v)
  }

  const handlePsrApprove = async (item: ManagerPostSaleRequestItem) => {
    if (!item.id) return
    logRefund('UI approve →', { id: item.id, status: item.status, orderId: item.orderId })
    setPsrActionId(item.id)
    try {
      const msg = await ManagerPostSaleRequestApi.approvePostSaleRequest(item.id)
      logRefund('UI approve ←', { id: item.id, message: msg })
      Toast.show({ type: 'success', text1: msg })
      setPsrRefreshKey((k) => k + 1)
      await reloadList()
    } catch (e) {
      logRefundError('UI approve failed', e)
      const msg = e instanceof Error ? e.message : 'Duyệt thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setPsrActionId(null)
    }
  }

  const handlePsrReject = async (item: ManagerPostSaleRequestItem) => {
    if (!item.id) return
    logRefund('UI reject →', { id: item.id, status: item.status, orderId: item.orderId })
    setPsrActionId(item.id)
    try {
      const msg = await ManagerPostSaleRequestApi.rejectPostSaleRequest(item.id)
      logRefund('UI reject ←', { id: item.id, message: msg })
      Toast.show({ type: 'success', text1: msg })
      setPsrRefreshKey((k) => k + 1)
      await reloadList()
    } catch (e) {
      logRefundError('UI reject failed', e)
      const msg = e instanceof Error ? e.message : 'Từ chối thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setPsrActionId(null)
    }
  }

  const openDetail = useCallback(async (orderId: string, opts?: { fromPostSale?: boolean }) => {
    setDetailId(orderId)
    setFromPostSaleList(!!opts?.fromPostSale)
    setDetail(null)
    setDetailError(null)
    setDetailLoading(true)
    try {
      const d = await ManagerOrderApi.getOrderById(orderId)
      setDetail(d)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Không tải chi tiết đơn.'
      setDetailError(msg)
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const closeDetail = () => {
    if (actionLoading) return
    setDetailId(null)
    setDetail(null)
    setDetailError(null)
    setFromPostSaleList(false)
  }

  const reloadList = async () => {
    await fetchOrdersPage(1, true)
  }

  const handleSubmitDraft = async () => {
    if (!detail || !canSubmitDraftOrder(detail, fromPostSaleList)) return
    setActionLoading(true)
    try {
      await ManagerOrderApi.submitDraftOrder(detail.id)
      Toast.show({ type: 'success', text1: 'Đã xác nhận đơn nháp.' })
      closeDetail()
      await reloadList()
      setPsrRefreshKey((k) => k + 1)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Xác nhận thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelOrder = () => {
    if (!detail || !canCancelOrder(detail)) return
    Alert.alert('Hủy đơn', `Hủy đơn ${detail.code || detail.id}?`, [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy đơn',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true)
          try {
            await ManagerOrderApi.cancelOrder(detail.id)
            Toast.show({ type: 'success', text1: 'Đã hủy đơn.' })
            closeDetail()
            await reloadList()
            setPsrRefreshKey((k) => k + 1)
          } catch (e) {
            const msg = typeof e === 'string' ? e : 'Hủy đơn thất bại.'
            Toast.show({ type: 'error', text1: msg })
          } finally {
            setActionLoading(false)
          }
        }
      }
    ])
  }

  const renderOrderCard = ({ item }: { item: ManagerOrderItem }) => {
    const st = orderStatusPill(item.status)
    const dv = deliveryStatusPill(item.deliveryStatus)
    return (
      <Pressable style={styles.card} onPress={() => openDetail(item.id, { fromPostSale: false })}>
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            <Text style={styles.code} numberOfLines={1}>
              {item.code || item.id}
            </Text>
            <User size={17} color="#64748b" strokeWidth={2} />
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.pill, { backgroundColor: st.bg }]}>
              <Text style={[styles.pillText, { color: st.color }]}>{st.label}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: dv.bg }]}>
              <Text style={[styles.pillText, { color: dv.color }]}>{dv.label}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.cusRow}>
          <User size={14} color="#94a3b8" strokeWidth={2} />
          <Text style={styles.cus} numberOfLines={1}>
            {item.customerName}
          </Text>
        </View>
        <Text style={styles.date}>{formatDateTime(item.orderDate)}</Text>
        <Text style={styles.amount}>{item.totalAmount?.toLocaleString('vi-VN')} đ</Text>
      </Pressable>
    )
  }

  const renderPsrCard = ({ item }: { item: ManagerPostSaleRequestItem }) => {
    const statusPill = postSaleStatusPill(item.status)
    const typePill = postSaleTypePill(item.type ?? '')
    const isPending = String(item.status) === 'Pending'
    const busy = psrActionId === item.id
    return (
      <View style={styles.psrCard}>
        <Pressable onPress={() => item.orderId && openDetail(item.orderId, { fromPostSale: true })}>
          <View style={styles.psrCardTop}>
            <View style={styles.psrCardTopLeft}>
              <Text style={styles.psrCodeLabel}>Mã</Text>
              <Text style={styles.psrCardTitle} numberOfLines={1}>
                {item.orderCode || '—'}
              </Text>
            </View>
            <View style={styles.psrBadgeRow}>
              <View style={[styles.pill, styles.psrOrderPill, { backgroundColor: statusPill.bg }]}>
                <Text style={[styles.pillText, { color: statusPill.color }]} numberOfLines={1}>
                  {statusPill.label}
                </Text>
              </View>
              <View style={[styles.pill, styles.psrOrderPill, { backgroundColor: typePill.bg }]}>
                <Text style={[styles.pillText, { color: typePill.color }]} numberOfLines={1}>
                  {typePill.label}
                </Text>
              </View>
            </View>
          </View>
          {item.refundAmount != null ? (
            <Text style={styles.psrAmount}>{item.refundAmount.toLocaleString('vi-VN')} đ</Text>
          ) : null}
          {item.requestedTime ? (
            <Text style={styles.psrDate}>{formatDateTime(item.requestedTime)}</Text>
          ) : null}
          {item.reason ? (
            <Text style={styles.psrReason} numberOfLines={2}>
              {item.reason}
            </Text>
          ) : null}
        </Pressable>
        {isPending && item.id ? (
          <View style={styles.psrActions}>
            <Pressable
              style={[styles.psrBtn, styles.psrBtnReject]}
              disabled={busy}
              onPress={() => handlePsrReject(item)}
            >
              <Text style={styles.psrBtnRejectText}>{busy ? '…' : 'Từ chối'}</Text>
            </Pressable>
            <Pressable
              style={[styles.psrBtn, styles.psrBtnApprove]}
              disabled={busy}
              onPress={() => handlePsrApprove(item)}
            >
              <Text style={styles.psrBtnApproveText}>{busy ? '…' : 'Duyệt'}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    )
  }

  const orderListFooter =
    meta.current_page < meta.total_pages ? (
      <View style={styles.footerPad}>{loadingMore ? <ActivityIndicator /> : null}</View>
    ) : null

  const psrListFooter =
    psrMeta.current_page < psrMeta.total_pages ? (
      <View style={styles.footerPad}>{psrLoadingMore ? <ActivityIndicator /> : null}</View>
    ) : null

  return (
    <View style={styles.safe}>
      <View style={styles.mainTabs}>
        <Pressable
          style={[styles.mainTab, mainTab === 'orders' && styles.mainTabOn]}
          onPress={() => setMainTab('orders')}
        >
          <FileText size={16} color={mainTab === 'orders' ? '#0f172a' : '#64748b'} strokeWidth={2.2} />
          <Text style={[styles.mainTabText, mainTab === 'orders' && styles.mainTabTextOn]}>Đơn</Text>
        </Pressable>
        <Pressable
          style={[styles.mainTab, mainTab === 'refund' && styles.mainTabOn]}
          onPress={() => setMainTab('refund')}
        >
          <RotateCcw size={16} color={mainTab === 'refund' ? '#0f172a' : '#64748b'} strokeWidth={2.2} />
          <Text style={[styles.mainTabText, mainTab === 'refund' && styles.mainTabTextOn]}>Hoàn trả</Text>
        </Pressable>
      </View>

      {mainTab === 'orders' ? (
        <View style={styles.tabPane}>
          <View style={styles.searchWrap}>
            <Input
              icon={{ iconName: Search, iconDirection: 'left' }}
              placeholder="Tìm đơn…"
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.filterBlock}>
            <Text style={styles.filterLabel}>Trạng thái</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipScroll}>
              {MANAGER_ORDER_STATUS_FILTERS.map((f) => {
                const on = statusFilter === f.value
                return (
                  <Pressable
                    key={f.value}
                    onPress={() => selectStatus(f.value)}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{f.label}</Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>

          {listError ? (
            <View style={styles.errBox}>
              <Text style={styles.errText}>{listError}</Text>
              <Pressable onPress={onRefresh}>
                <Text style={styles.link}>Thử lại</Text>
              </Pressable>
            </View>
          ) : null}

          {loading && items.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ManagerOrderCardSkeletonV2 key={i}/>
            ))
          ) : (
            <FlatList
              style={styles.list}
              data={items}
              keyExtractor={(o) => o.id}
              renderItem={renderOrderCard}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={<Text style={styles.empty}>Không có đơn.</Text>}
              ListFooterComponent={orderListFooter}
              onEndReached={onLoadMore}
              onEndReachedThreshold={0.35}
            />
          )}
        </View>
      ) : (
        <View style={styles.tabPane}>
          <View style={styles.psrFilterRow}>
            {PSR_STATUS_FILTERS.map((f) => {
              const on = psrStatusFilter === f.value
              return (
                <Pressable
                  key={f.value}
                  onPress={() => setPsrStatusFilter(f.value)}
                  style={[styles.psrChip, on ? styles.chipOn : styles.chipOff]}
                >
                  <Text style={[styles.psrChipText, on && styles.chipTextOn]} numberOfLines={1}>
                    {f.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
          {psrError ? (
            <View style={styles.errBox}>
              <Text style={styles.errText}>{psrError}</Text>
              <Pressable onPress={onRefreshPsr}>
                <Text style={styles.link}>Thử lại</Text>
              </Pressable>
            </View>
          ) : null}
          {psrLoading && psrItems.length === 0 ? (
             Array.from({ length: 4 }).map((_, i) => (
              <ManagerPostSaleItemSkeleton key={i}/>
          ))
          ) : (
            <FlatList
              style={styles.list}
              data={filteredPsrItems}
              keyExtractor={(r, idx) => r.id || `${r.orderId}-${idx}`}
              renderItem={renderPsrCard}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={psrRefreshing} onRefresh={onRefreshPsr} />}
              ListEmptyComponent={<Text style={styles.empty}>Không có yêu cầu hoàn tiền.</Text>}
              ListFooterComponent={psrListFooter}
              onEndReached={onLoadMorePsr}
              onEndReachedThreshold={0.35}
            />
          )}
        </View>
      )}

      <Modal visible={!!detailId} transparent animationType="slide" onRequestClose={closeDetail}>
        <Pressable style={styles.backdrop} onPress={closeDetail}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <ScrollView>
              <Text style={styles.sheetTitle}>Chi tiết đơn</Text>
              {detailLoading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
              {detailError ? <Text style={styles.errText}>{detailError}</Text> : null}
              {detail ? (
                <>
                  <View style={styles.detailIntro}>
                    <View style={[styles.statusPillMuted, { backgroundColor: orderStatusPill(detail.status).bg }]}>
                      <Text style={[styles.statusPillMutedText, { color: orderStatusPill(detail.status).color }]}>
                        {orderStatusPill(detail.status).label}
                      </Text>
                    </View>
                    <View style={styles.loaiDonRow}>
                      <FileText size={16} color="#64748b" strokeWidth={2} />
                      <Text style={styles.loaiDonText}>
                        Loại đơn: {orderStatusPill(detail.status).label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailMainRow}>
                    <View style={styles.detailFieldsCol}>
                      <DetailField Icon={Tag} label="Mã" value={detail.code || detail.id} />
                      <DetailField Icon={User} label="Khách" value={detail.customerName || '—'} />
                      <DetailField Icon={Smartphone} label="SĐT" value={detail.customerPhone || '—'} />
                      <DetailField Icon={MapPin} label="Địa chỉ" value={detail.customerAddress || '—'} />
                      <DetailField
                        Icon={CreditCard}
                        label="Tổng"
                        value={`${detail.totalAmount?.toLocaleString('vi-VN') ?? '0'} đ`}
                        emphasis
                      />
                    </View>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarLetter}>{customerInitials(detail.customerName || detail.name)}</Text>
                    </View>
                  </View>

                  <View style={styles.tableBlock}>
                    <View style={styles.tableHead}>
                      <View style={styles.tableIconCell}>
                        <List size={15} color="#64748b" strokeWidth={2} />
                      </View>
                      <Text style={[styles.th, styles.thProduct]}>Dòng hàng</Text>
                      <Text style={[styles.th, styles.thQty]}>SL</Text>
                      <Text style={[styles.th, styles.thPrice]}>Giá</Text>
                      <Text style={[styles.th, styles.thTotal]}>Thành tiền</Text>
                    </View>
                    {(detail.orderItems ?? []).map((li) => {
                      const unit = li.itemsPrice != null ? `${li.itemsPrice.toLocaleString('vi-VN')}đ` : '—'
                      const lineTot =
                        li.itemsPrice != null
                          ? `${(li.quantity * li.itemsPrice).toLocaleString('vi-VN')} đ`
                          : '—'
                      return (
                        <View key={li.id} style={styles.tableRow}>
                          <View style={styles.tableIconCell} />
                          <Text style={[styles.td, styles.thProduct]} numberOfLines={2}>
                            {li.productName}
                          </Text>
                          <Text style={[styles.td, styles.thQty]}>{li.quantity}</Text>
                          <Text style={[styles.td, styles.thPrice]}>{unit}</Text>
                          <Text style={[styles.td, styles.thTotal, styles.tdStrong]}>{lineTot}</Text>
                        </View>
                      )
                    })}
                  </View>

                  <View style={styles.timeBar}>
                    <Text style={styles.timeBarText} numberOfLines={1}>
                      Tạo lúc: {formatDateTime(detail.orderDate)}
                    </Text>
                    <Text style={styles.timeBarText} numberOfLines={1}>
                      Cập nhật:{' '}
                      {detail.updatedAt ? formatDateTime(detail.updatedAt) : formatDateTime(detail.orderDate)}
                    </Text>
                  </View>

                  {canSubmitDraftOrder(detail, fromPostSaleList) ? (
                    <Pressable
                      style={styles.btnPrimary}
                      disabled={actionLoading}
                      onPress={handleSubmitDraft}
                    >
                      <Text style={styles.btnPrimaryText}>{actionLoading ? 'Đang gửi…' : 'Xác nhận đơn nháp'}</Text>
                    </Pressable>
                  ) : null}
                  {canCancelOrder(detail) ? (
                    <Pressable style={styles.btnDanger} disabled={actionLoading} onPress={handleCancelOrder}>
                      <Text style={styles.btnDangerText}>Hủy đơn (chờ giao)</Text>
                    </Pressable>
                  ) : null}
                </>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f1f5f9' },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a', paddingHorizontal: 16, marginBottom: 8 },
  mainTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
    gap: 4
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10
  },
  mainTabOn: { backgroundColor: '#fff' },
  mainTabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  mainTabTextOn: { color: '#0f172a' },
  tabPane: { flex: 1, minHeight: 0 },
  searchWrap: {
    marginHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: { height: 50 },
  filterBlock: { paddingHorizontal: 16, marginTop: 10, marginBottom: 4 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 6 },
  chipRow: { maxHeight: 40 },
  chipScroll: { flexDirection: 'row', alignItems: 'center', paddingBottom: 2 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6
  },
  chipOff: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#93c5fd'
  },
  chipOn: { backgroundColor: '#1e40af', borderWidth: 1.5, borderColor: '#1e40af' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  chipTextOn: { color: '#fff' },
  errBox: { marginHorizontal: 16, marginTop: 8 },
  errText: { color: '#b91c1c', fontSize: 14 },
  link: { color: '#2563eb', fontWeight: '600', marginTop: 4 },
  list: { flex: 1, marginTop: 6 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, marginRight: 8 },
  code: { fontSize: 16, fontWeight: '800', color: '#0f172a', flexShrink: 1 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6, maxWidth: '52%' },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pillText: { fontSize: 11, fontWeight: '700' },
  name: { fontSize: 15, fontWeight: '600', color: '#1e293b', lineHeight: 21 },
  cusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  cus: { fontSize: 13, color: '#475569', flex: 1 },
  date: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  amount: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginTop: 10 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 32 },
  footerPad: { paddingVertical: 12, alignItems: 'center' },
  psrFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10
  },
  psrChip: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  psrChipText: { fontSize: 12, fontWeight: '600', color: '#1e40af', textAlign: 'center' },
  psrErr: { fontSize: 12, color: '#b91c1c', marginBottom: 8 },
  psrCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fed7aa'
  },
  psrCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  psrCardTopLeft: { flex: 1, minWidth: 0 },
  psrCodeLabel: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  psrCardTitle: { fontSize: 16, fontWeight: '800', color: '#9a3412' },
  psrBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', maxWidth: '52%', marginTop: 12 },
  psrOrderPill: { flexShrink: 0 },
  psrAmount: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginTop: 6 },
  psrDate: { fontSize: 12, color: '#64748b', marginTop: 4 },
  psrReason: { fontSize: 13, color: '#57534e', marginTop: 6 },
  psrActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  psrBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  psrBtnReject: { backgroundColor: '#fee2e2' },
  psrBtnRejectText: { color: '#b91c1c', fontWeight: '700', fontSize: 13 },
  psrBtnApprove: { backgroundColor: '#dcfce7' },
  psrBtnApproveText: { color: '#15803d', fontWeight: '700', fontSize: 13 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '92%'
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  detailIntro: { marginBottom: 12 },
  statusPillMuted: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusPillMutedText: { fontSize: 12, fontWeight: '700' },
  loaiDonRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  loaiDonText: { fontSize: 14, fontWeight: '600', color: '#334155', flex: 1 },
  detailMainRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  detailFieldsCol: { flex: 1, minWidth: 0 },
  detailField: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  detailIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailFieldBody: { flex: 1, minWidth: 0 },
  detailFieldLabel: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  detailFieldValue: { fontSize: 15, color: '#0f172a', lineHeight: 21 },
  detailFieldEmphasis: { fontSize: 17, fontWeight: '800' },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  avatarLetter: { fontSize: 18, fontWeight: '800', color: '#475569' },
  tableBlock: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 8
  },
  tableHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  tableIconCell: { width: 26, alignItems: 'center', justifyContent: 'center' },
  th: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  thProduct: { flex: 2.2, minWidth: 0 },
  thQty: { width: 34, textAlign: 'center' },
  thPrice: { flex: 1, minWidth: 0, textAlign: 'right' },
  thTotal: { flex: 1.1, minWidth: 0, textAlign: 'right' },
  tableRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f1f5f9' },
  td: { fontSize: 12, color: '#334155' },
  tdStrong: { fontWeight: '800', color: '#0f172a' },
  timeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12
  },
  timeBarText: { fontSize: 11, color: '#64748b', flex: 1 },
  btnPrimary: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center'
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnDanger: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    alignItems: 'center'
  },
  btnDangerText: { color: '#b91c1c', fontWeight: '700' }
})
