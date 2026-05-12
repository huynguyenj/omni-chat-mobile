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
import { ManagerOrderApi } from '../api/manager-order-api'
import { ManagerPostSaleRequestApi } from '../api/manager-post-sale-request-api'
import type { ManagerOrderDetail, ManagerOrderItem } from '../types/manager-order-type'
import type { ManagerPostSaleRequestItem } from '../types/manager-post-sale-request-type'
import { formatDateTime } from '../utils/claimsNormalize'
import {
  canCancelOrder,
  canSubmitDraftOrder,
  deliveryStatusPill,
  orderStatusPill
} from '../utils/managerOrdersNormalize'

const ORDER_PAGE = 6
const PSR_PAGE = 6

const ORDER_STATUS_FILTERS: { value: string | null; label: string }[] = [
  { value: null, label: 'Tất cả' },
  { value: 'Draft', label: 'Nháp' },
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Shipped', label: 'Đã gửi' },
  { value: 'Completed', label: 'Hoàn tất' },
  { value: 'Cancelled', label: 'Đã hủy' },
  { value: 'PendingReturn', label: 'Chờ trả' },
  { value: 'Returned', label: 'Đã trả' },
  { value: 'ReturnedDefective', label: 'Trả lỗi' }
]

function postSaleStatusLabel(status: string) {
  const s = status.toLowerCase()
  if (s.includes('pending')) return 'Chờ xử lý'
  if (s.includes('approve')) return 'Đã duyệt'
  if (s.includes('reject')) return 'Từ chối'
  return status || '—'
}

export default function OrdersManagementScreen() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

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
  const [psrError, setPsrError] = useState<string | null>(null)
  const [psrRefreshKey, setPsrRefreshKey] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 450)
    return () => clearTimeout(t)
  }, [search])

  const orderStatusesParam = useMemo(
    () => (statusFilter ? [statusFilter] : undefined),
    [statusFilter]
  )

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
    const res = await ManagerPostSaleRequestApi.getRequests(pageNumber, PSR_PAGE)
    const m = res.meta
    setPsrMeta({ total_pages: m.total_pages ?? 1, current_page: m.current_page ?? pageNumber })
    setPsrItems((prev) => (reset ? res.items : [...prev, ...res.items]))
  }, [])

  useEffect(() => {
    let cancelled = false
    setPsrLoading(true)
    setPsrError(null)
    setPsrItems([])
    ;(async () => {
      try {
        await fetchPsrPage(1, true)
      } catch (e) {
        if (!cancelled) {
          const msg = typeof e === 'string' ? e : 'Không tải yêu cầu hoàn/refund.'
          setPsrError(msg)
        }
      } finally {
        if (!cancelled) setPsrLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fetchPsrPage, psrRefreshKey])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setListError(null)
    try {
      await fetchOrdersPage(1, true)
      setPsrRefreshKey((k) => k + 1)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Làm mới thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setRefreshing(false)
    }
  }, [fetchOrdersPage])

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

  const selectStatus = (v: string | null) => {
    setStatusFilter(v)
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
          <Text style={styles.code}>{item.code || item.id}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.pill, { backgroundColor: st.bg }]}>
              <Text style={[styles.pillText, { color: st.color }]}>{st.label}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: dv.bg }]}>
              <Text style={[styles.pillText, { color: dv.color }]}>{dv.label}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cus} numberOfLines={1}>
          {item.customerName}
        </Text>
        <Text style={styles.date}>{formatDateTime(item.orderDate)}</Text>
        <Text style={styles.amount}>{item.totalAmount?.toLocaleString('vi-VN')} đ</Text>
      </Pressable>
    )
  }

  const psrFooter = (
    <View style={styles.psrSection}>
      <Text style={styles.psrTitle}>Yêu cầu hoàn / refund</Text>
      <Text style={styles.psrSub}>Mở đơn từ đây sẽ không hiện nút xác nhận nháp (post-sale).</Text>
      {psrError ? <Text style={styles.psrErr}>{psrError}</Text> : null}
      {psrLoading && psrItems.length === 0 ? (
        <ActivityIndicator style={{ marginVertical: 8 }} />
      ) : (
        <>
          {psrItems.map((r, idx) => (
            <Pressable
              key={r.id || `${r.orderId}-${idx}`}
              style={styles.psrCard}
              onPress={() => r.orderId && openDetail(r.orderId, { fromPostSale: true })}
            >
              <Text style={styles.psrCardTitle}>Đơn #{r.orderId || '—'}</Text>
              <Text style={styles.psrCardMeta}>{postSaleStatusLabel(r.status)}</Text>
              {r.reason ? (
                <Text style={styles.psrReason} numberOfLines={2}>
                  {r.reason}
                </Text>
              ) : null}
            </Pressable>
          ))}
          {psrMeta.current_page < psrMeta.total_pages ? (
            <Pressable style={styles.psrMore} onPress={onLoadMorePsr} disabled={psrLoadingMore}>
              <Text style={styles.psrMoreText}>{psrLoadingMore ? 'Đang tải…' : 'Tải thêm yêu cầu'}</Text>
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  )

  const listFooter = (
    <>
      {psrFooter}
      {meta.current_page < meta.total_pages ? (
        <View style={styles.footerPad}>{loadingMore ? <ActivityIndicator /> : null}</View>
      ) : null}
    </>
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <Text style={styles.title}>Đơn hàng</Text>

      <TextInput
        placeholder="Tìm đơn…"
        placeholderTextColor="#9ca3af"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <View style={styles.filterBlock}>
        <Text style={styles.filterLabel}>Trạng thái</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipScroll}>
          {ORDER_STATUS_FILTERS.map((f) => {
            const on = statusFilter === f.value
            return (
              <Pressable key={String(f.value ?? 'all')} onPress={() => selectStatus(f.value)} style={[styles.chip, on && styles.chipOn]}>
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
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          style={styles.list}
          data={items}
          keyExtractor={(o) => o.id}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>Không có đơn.</Text>}
          ListFooterComponent={listFooter}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.35}
          ListFooterComponentStyle={styles.footerWrap}
        />
      )}

      <Modal visible={!!detailId} transparent animationType="slide" onRequestClose={closeDetail}>
        <Pressable style={styles.backdrop} onPress={closeDetail}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <ScrollView>
              <Text style={styles.sheetTitle}>Chi tiết đơn</Text>
              {fromPostSaleList ? (
                <Text style={styles.psrBanner}>Đang xem từ yêu cầu hoàn/refund — không xác nhận nháp tại đây.</Text>
              ) : null}
              {detailLoading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
              {detailError ? <Text style={styles.errText}>{detailError}</Text> : null}
              {detail ? (
                <>
                  <View style={styles.badgeRow}>
                    <View style={[styles.pill, { backgroundColor: orderStatusPill(detail.status).bg }]}>
                      <Text style={[styles.pillText, { color: orderStatusPill(detail.status).color }]}>
                        {orderStatusPill(detail.status).label}
                      </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: deliveryStatusPill(detail.deliveryStatus).bg }]}>
                      <Text style={[styles.pillText, { color: deliveryStatusPill(detail.deliveryStatus).color }]}>
                        {deliveryStatusPill(detail.deliveryStatus).label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.k}>Mã</Text>
                  <Text style={styles.v}>{detail.code}</Text>
                  <Text style={styles.k}>Khách</Text>
                  <Text style={styles.v}>{detail.customerName}</Text>
                  <Text style={styles.k}>SĐT</Text>
                  <Text style={styles.v}>{detail.customerPhone}</Text>
                  <Text style={styles.k}>Địa chỉ</Text>
                  <Text style={styles.v}>{detail.customerAddress}</Text>
                  <Text style={styles.k}>Tổng</Text>
                  <Text style={styles.v}>{detail.totalAmount?.toLocaleString('vi-VN')} đ</Text>
                  <Text style={styles.k}>Dòng hàng</Text>
                  {(detail.orderItems ?? []).map((li) => (
                    <Text key={li.id} style={styles.line}>
                      • {li.productName} × {li.quantity}
                    </Text>
                  ))}
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a', paddingHorizontal: 16, marginBottom: 8 },
  search: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#0f172a'
  },
  filterBlock: { paddingHorizontal: 16, marginTop: 8, marginBottom: 4 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 6 },
  chipRow: { maxHeight: 40 },
  chipScroll: { flexDirection: 'row', alignItems: 'center', paddingBottom: 2 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 6
  },
  chipOn: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipTextOn: { color: '#fff' },
  errBox: { marginHorizontal: 16, marginTop: 8 },
  errText: { color: '#b91c1c', fontSize: 14 },
  link: { color: '#2563eb', fontWeight: '600', marginTop: 4 },
  list: { flex: 1, marginTop: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  code: { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 6, marginBottom: 4 },
  pillText: { fontSize: 11, fontWeight: '700' },
  name: { fontSize: 15, color: '#334155' },
  cus: { fontSize: 13, color: '#64748b', marginTop: 2 },
  date: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  amount: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 6 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 32 },
  footerPad: { paddingVertical: 12, alignItems: 'center' },
  footerWrap: { paddingTop: 8 },
  psrSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  psrTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  psrSub: { fontSize: 12, color: '#64748b', marginBottom: 10 },
  psrErr: { fontSize: 12, color: '#b91c1c', marginBottom: 8 },
  psrCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fed7aa'
  },
  psrCardTitle: { fontSize: 15, fontWeight: '700', color: '#9a3412' },
  psrCardMeta: { fontSize: 13, color: '#c2410c', marginTop: 4 },
  psrReason: { fontSize: 13, color: '#57534e', marginTop: 6 },
  psrMore: { paddingVertical: 10, alignItems: 'center' },
  psrMoreText: { color: '#2563eb', fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '90%'
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  psrBanner: {
    fontSize: 12,
    color: '#9a3412',
    backgroundColor: '#ffedd5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8
  },
  k: { fontSize: 12, color: '#64748b', marginTop: 8 },
  v: { fontSize: 15, color: '#0f172a' },
  line: { fontSize: 14, color: '#334155', marginTop: 4 },
  btnPrimary: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center'
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnDanger: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    alignItems: 'center'
  },
  btnDangerText: { color: '#b91c1c', fontWeight: '700' }
})
