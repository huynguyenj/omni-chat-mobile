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
import { Phone, Truck } from 'lucide-react-native'
import { ManagerOrderApi } from '../api/manager-order-api'
import { ManagerShipperApi } from '../api/manager-shipper-api'
import type { ManagerOrderDetail, ManagerOrderItem } from '../types/manager-order-type'
import type { ManagerShipperApiItem } from '../types/shipper-type'
import { formatDateTime } from '../utils/claimsNormalize'
import {
  canCancelOrder,
  deliveryStatusPill,
  orderStatusPill
} from '../utils/managerOrdersNormalize'
import { shipperActivityPill } from '../utils/managerShipperNormalize'

const SHIPPER_PAGE = 8
const ORDER_PAGE = 8

const ORDER_STATUS_OPTIONS = ['Draft', 'Confirmed', 'Completed', 'Cancelled'] as const

type MainTab = 'orders' | 'shippers'

export default function ShippersTransportScreen() {
  const [mainTab, setMainTab] = useState<MainTab>('orders')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  /** Một trạng thái hoặc `null` = tất cả (không gửi filter). */
  const [orderStatusFilter, setOrderStatusFilter] = useState<string | null>('Confirmed')

  const [shippers, setShippers] = useState<ManagerShipperApiItem[]>([])
  const [shipperMeta, setShipperMeta] = useState({ total_pages: 1, current_page: 1 })
  const [shipperLoading, setShipperLoading] = useState(true)
  const [shipperLoadingMore, setShipperLoadingMore] = useState(false)
  const [shipperRefreshing, setShipperRefreshing] = useState(false)
  const [shipperError, setShipperError] = useState<string | null>(null)

  const [orders, setOrders] = useState<ManagerOrderItem[]>([])
  const [orderMeta, setOrderMeta] = useState({ total_pages: 1, current_page: 1 })
  const [orderLoading, setOrderLoading] = useState(true)
  const [orderLoadingMore, setOrderLoadingMore] = useState(false)
  const [orderRefreshing, setOrderRefreshing] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  const [assignOrderId, setAssignOrderId] = useState<string | null>(null)
  const [assignSubmitting, setAssignSubmitting] = useState(false)

  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ManagerOrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 500)
    return () => clearTimeout(t)
  }, [search])

  const orderQueryStatuses = useMemo(
    () => (orderStatusFilter ? [orderStatusFilter] : undefined),
    [orderStatusFilter]
  )

  const fetchShippersPage = useCallback(async (page: number, reset: boolean) => {
    const res = await ManagerShipperApi.getShippers({ pageIndex: page, pageSize: SHIPPER_PAGE })
    const m = res.meta
    setShipperMeta({ total_pages: m.total_pages ?? 1, current_page: m.current_page ?? page })
    setShippers((prev) => (reset ? res.items : [...prev, ...res.items]))
  }, [])

  const fetchOrdersPage = useCallback(
    async (page: number, reset: boolean) => {
      const res = await ManagerOrderApi.getOrders({
        page,
        pageSize: ORDER_PAGE,
        search: debouncedSearch || undefined,
        orderStatuses: orderQueryStatuses
      })
      const m = res.meta
      setOrderMeta({ total_pages: m.total_pages ?? 1, current_page: m.current_page ?? page })
      setOrders((prev) => (reset ? res.items : [...prev, ...res.items]))
    },
    [debouncedSearch, orderQueryStatuses]
  )

  useEffect(() => {
    let cancelled = false
    setShipperLoading(true)
    setShipperError(null)
    setShippers([])
    ;(async () => {
      try {
        await fetchShippersPage(1, true)
      } catch (e) {
        if (!cancelled) {
          const msg = typeof e === 'string' ? e : 'Không tải được shipper.'
          setShipperError(msg)
          Toast.show({ type: 'error', text1: msg })
        }
      } finally {
        if (!cancelled) setShipperLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fetchShippersPage])

  useEffect(() => {
    let cancelled = false
    setOrderLoading(true)
    setOrderError(null)
    setOrders([])
    ;(async () => {
      try {
        await fetchOrdersPage(1, true)
      } catch (e) {
        if (!cancelled) {
          const msg = typeof e === 'string' ? e : 'Không tải được đơn hàng.'
          setOrderError(msg)
          Toast.show({ type: 'error', text1: msg })
        }
      } finally {
        if (!cancelled) setOrderLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fetchOrdersPage])

  const onRefreshShippers = useCallback(async () => {
    setShipperRefreshing(true)
    setShipperError(null)
    try {
      await fetchShippersPage(1, true)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Làm mới shipper thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setShipperRefreshing(false)
    }
  }, [fetchShippersPage])

  const onLoadMoreShippers = useCallback(async () => {
    if (shipperLoading || shipperLoadingMore || shipperRefreshing) return
    if (shipperMeta.current_page >= shipperMeta.total_pages) return
    const next = shipperMeta.current_page + 1
    setShipperLoadingMore(true)
    try {
      await fetchShippersPage(next, false)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Không tải thêm shipper.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setShipperLoadingMore(false)
    }
  }, [shipperLoading, shipperLoadingMore, shipperRefreshing, shipperMeta, fetchShippersPage])

  const onRefreshOrders = useCallback(async () => {
    setOrderRefreshing(true)
    setOrderError(null)
    try {
      await fetchOrdersPage(1, true)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Làm mới đơn thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setOrderRefreshing(false)
    }
  }, [fetchOrdersPage])

  const onLoadMoreOrders = useCallback(async () => {
    if (orderLoading || orderLoadingMore || orderRefreshing) return
    if (orderMeta.current_page >= orderMeta.total_pages) return
    const next = orderMeta.current_page + 1
    setOrderLoadingMore(true)
    try {
      await fetchOrdersPage(next, false)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Không tải thêm đơn.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setOrderLoadingMore(false)
    }
  }, [orderLoading, orderLoadingMore, orderRefreshing, orderMeta, fetchOrdersPage])

  const selectOrderStatus = (value: string | null) => {
    setOrderStatusFilter(value)
  }

  const openAssign = (orderId: string) => setAssignOrderId(orderId)

  const closeAssign = () => {
    if (!assignSubmitting) setAssignOrderId(null)
  }

  const confirmAssign = async (shipper: ManagerShipperApiItem) => {
    if (!assignOrderId) return
    setAssignSubmitting(true)
    try {
      await ManagerShipperApi.assignOrderToShipper(shipper.id, assignOrderId)
      Toast.show({ type: 'success', text1: 'Đã gán shipper cho đơn.' })
      setAssignOrderId(null)
      await fetchOrdersPage(1, true)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Gán shipper thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setAssignSubmitting(false)
    }
  }

  const openDetail = useCallback(async (orderId: string) => {
    setDetailOrderId(orderId)
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
    if (cancelSubmitting) return
    setDetailOrderId(null)
    setDetail(null)
    setDetailError(null)
  }

  const reloadDetailIfOpen = async () => {
    if (!detailOrderId) return
    try {
      const d = await ManagerOrderApi.getOrderById(detailOrderId)
      setDetail(d)
    } catch {
      /* ignore */
    }
  }

  const confirmCancelOrder = () => {
    if (!detail || !canCancelOrder(detail)) return
    Alert.alert('Hủy đơn hàng', `Hủy đơn ${detail.code || detail.id}?`, [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy đơn',
        style: 'destructive',
        onPress: async () => {
          setCancelSubmitting(true)
          try {
            await ManagerOrderApi.cancelOrder(detail.id)
            Toast.show({ type: 'success', text1: 'Đã hủy đơn.' })
            await fetchOrdersPage(1, true)
            await reloadDetailIfOpen()
          } catch (e) {
            const msg = typeof e === 'string' ? e : 'Hủy đơn thất bại.'
            Toast.show({ type: 'error', text1: msg })
          } finally {
            setCancelSubmitting(false)
          }
        }
      }
    ])
  }

  const shipperListHeader = useMemo(
    () => (
      <View style={styles.shipperListHeader}>
        <Text style={styles.shipperListTitle}>Danh sách Shipper</Text>
        <Text style={styles.shipperListSub}>Quản lý đội ngũ giao hàng</Text>
      </View>
    ),
    []
  )

  const renderShipper = ({ item }: { item: ManagerShipperApiItem }) => {
    const pill = shipperActivityPill(item)
    return (
      <View style={styles.shipCard}>
        <View style={styles.shipCardTop}>
          <View style={styles.shipAvatar}>
            <Truck size={22} color="#fff" strokeWidth={2.2} />
          </View>
          <View style={styles.shipCardMain}>
            <View style={styles.shipNameRow}>
              <Text style={styles.shipCardName} numberOfLines={1}>
                {item.fullName}
              </Text>
              <View style={[styles.activityPill, pill.active ? styles.activityPillOn : styles.activityPillOff]}>
                <Text style={[styles.activityPillText, pill.active ? styles.activityPillTextOn : styles.activityPillTextOff]}>
                  {pill.label}
                </Text>
              </View>
            </View>
            <View style={styles.shipPhoneRow}>
              <Phone size={14} color="#64748b" />
              <Text style={styles.shipPhone}>{item.phone ?? '—'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.shipStatRow}>
          <View style={[styles.shipStatBox, styles.shipStatBoxSp]}>
            <Text style={styles.shipStatLabel}>ĐANG GIAO</Text>
            <Text style={styles.shipStatVal}>{item.deliveringCount}</Text>
          </View>
          <View style={styles.shipStatBox}>
            <Text style={styles.shipStatLabel}>ĐÃ GIAO</Text>
            <Text style={styles.shipStatVal}>{item.deliveredCount}</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderOrder = ({ item }: { item: ManagerOrderItem }) => {
    const st = orderStatusPill(item.status)
    const dv = deliveryStatusPill(item.deliveryStatus)
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderTop}>
          <Text style={styles.orderCode}>{item.code || item.id}</Text>
          <View style={styles.orderBadges}>
            <View style={[styles.miniPill, { backgroundColor: st.bg }]}>
              <Text style={[styles.miniPillText, { color: st.color }]}>{st.label}</Text>
            </View>
            <View style={[styles.miniPill, { backgroundColor: dv.bg }]}>
              <Text style={[styles.miniPillText, { color: dv.color }]}>{dv.label}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.orderName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.orderCus} numberOfLines={1}>
          {item.customerName}
        </Text>
        <Text style={styles.orderDate}>{formatDateTime(item.orderDate)}</Text>
        <View style={styles.orderActions}>
          <Pressable style={styles.btnGhost} onPress={() => openDetail(item.id)}>
            <Text style={styles.btnGhostText}>Chi tiết</Text>
          </Pressable>
          <Pressable style={styles.btnPrimarySm} onPress={() => openAssign(item.id)}>
            <Text style={styles.btnPrimarySmText}>Gán shipper</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <Text style={styles.title}>Vận chuyển</Text>

      <View style={styles.mainTabs}>
        <Pressable
          onPress={() => setMainTab('orders')}
          style={[styles.mainTab, styles.mainTabLeft, mainTab === 'orders' && styles.mainTabOn]}
        >
          <Text style={[styles.mainTabText, mainTab === 'orders' && styles.mainTabTextOn]}>Đơn hàng</Text>
        </Pressable>
        <Pressable
          onPress={() => setMainTab('shippers')}
          style={[styles.mainTab, mainTab === 'shippers' && styles.mainTabOn]}
        >
          <Text style={[styles.mainTabText, mainTab === 'shippers' && styles.mainTabTextOn]}>Shipper</Text>
        </Pressable>
      </View>

      <View style={styles.tabPanel}>
        {mainTab === 'orders' ? (
          <>
            <TextInput
              placeholder="Tìm đơn (mã, tên, SĐT…)"
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
              style={styles.search}
            />

            <View style={styles.filterBlock}>
              <Text style={styles.filterLabel}>Trạng thái đơn</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipRow}
                contentContainerStyle={styles.chipScroll}
              >
                <Pressable
                  onPress={() => selectOrderStatus(null)}
                  style={[styles.chipSm, orderStatusFilter === null && styles.chipOn]}
                >
                  <Text style={[styles.chipSmText, orderStatusFilter === null && styles.chipTextOn]}>Tất cả</Text>
                </Pressable>
                {ORDER_STATUS_OPTIONS.map((s) => {
                  const on = orderStatusFilter === s
                  return (
                    <Pressable key={s} onPress={() => selectOrderStatus(s)} style={[styles.chipSm, on && styles.chipOn]}>
                      <Text style={[styles.chipSmText, on && styles.chipTextOn]}>{s}</Text>
                    </Pressable>
                  )
                })}
              </ScrollView>
              {orderStatusFilter === null ? (
                <Text style={styles.hintInline}>Tất cả đơn — có thể chậm hơn khi lọc.</Text>
              ) : null}
            </View>
            {orderError ? (
              <View style={styles.errInline}>
                <Text style={styles.errText}>{orderError}</Text>
                <Pressable onPress={onRefreshOrders}>
                  <Text style={styles.link}>Thử lại</Text>
                </Pressable>
              </View>
            ) : null}
            {orderLoading && orders.length === 0 ? (
              <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : (
              <FlatList
                style={styles.tabList}
                data={orders}
                keyExtractor={(o) => o.id}
                renderItem={renderOrder}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={orderRefreshing} onRefresh={onRefreshOrders} />}
                ListEmptyComponent={<Text style={styles.emptySm}>Không có đơn phù hợp.</Text>}
                onEndReached={onLoadMoreOrders}
                onEndReachedThreshold={0.35}
                ListFooterComponent={
                  orderMeta.current_page < orderMeta.total_pages ? (
                    <View style={styles.footerPad}>{orderLoadingMore ? <ActivityIndicator /> : null}</View>
                  ) : null
                }
              />
            )}
          </>
        ) : (
          <>
            {shipperError ? (
              <View style={styles.errInline}>
                <Text style={styles.errText}>{shipperError}</Text>
                <Pressable onPress={onRefreshShippers}>
                  <Text style={styles.link}>Thử lại</Text>
                </Pressable>
              </View>
            ) : null}
            {shipperLoading && shippers.length === 0 ? (
              <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : (
              <FlatList
                style={styles.tabList}
                data={shippers}
                keyExtractor={(s) => s.id}
                renderItem={renderShipper}
                ListHeaderComponent={shipperListHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={shipperRefreshing} onRefresh={onRefreshShippers} />}
                ListEmptyComponent={<Text style={styles.emptySm}>Chưa có shipper.</Text>}
                onEndReached={onLoadMoreShippers}
                onEndReachedThreshold={0.35}
                ListFooterComponent={
                  shipperMeta.current_page < shipperMeta.total_pages ? (
                    <View style={styles.footerPad}>{shipperLoadingMore ? <ActivityIndicator /> : null}</View>
                  ) : null
                }
              />
            )}
          </>
        )}
      </View>

      <Modal visible={!!assignOrderId} transparent animationType="slide" onRequestClose={closeAssign}>
        <Pressable style={styles.backdrop} onPress={closeAssign}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Chọn shipper</Text>
            <Text style={styles.sheetSub}>Đơn: {assignOrderId}</Text>
            <FlatList
              data={shippers}
              keyExtractor={(s) => s.id}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.pickRow}
                  disabled={assignSubmitting}
                  onPress={() => confirmAssign(item)}
                >
                  <Text style={styles.pickName}>{item.fullName}</Text>
                  <Text style={styles.pickSub}>
                    {shipperActivityPill(item).label}
                    {item.phone ? ` · ${item.phone}` : ''}
                  </Text>
                  <Text style={styles.pickMeta}>
                    Đang giao: {item.deliveringCount} · Đã giao: {item.deliveredCount}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={<Text style={styles.emptySm}>Chưa tải shipper.</Text>}
            />
            <Pressable style={styles.btnGhostWide} onPress={closeAssign} disabled={assignSubmitting}>
              <Text style={styles.btnGhostText}>Đóng</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!detailOrderId} transparent animationType="slide" onRequestClose={closeDetail}>
        <Pressable style={styles.backdrop} onPress={closeDetail}>
          <Pressable style={styles.sheetLg} onPress={(e) => e.stopPropagation()}>
            <ScrollView>
              <Text style={styles.sheetTitle}>Chi tiết đơn</Text>
              {detailLoading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
              {detailError ? <Text style={styles.errText}>{detailError}</Text> : null}
              {detail ? (
                <>
                  <View style={styles.orderBadges}>
                    <View style={[styles.miniPill, { backgroundColor: orderStatusPill(detail.status).bg }]}>
                      <Text style={[styles.miniPillText, { color: orderStatusPill(detail.status).color }]}>
                        {orderStatusPill(detail.status).label}
                      </Text>
                    </View>
                    <View style={[styles.miniPill, { backgroundColor: deliveryStatusPill(detail.deliveryStatus).bg }]}>
                      <Text style={[styles.miniPillText, { color: deliveryStatusPill(detail.deliveryStatus).color }]}>
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
                  <Text style={styles.k}>Tổng tiền</Text>
                  <Text style={styles.v}>{detail.totalAmount?.toLocaleString('vi-VN')} đ</Text>
                  <Text style={styles.k}>Dòng hàng</Text>
                  {(detail.orderItems ?? []).map((li) => (
                    <Text key={li.id} style={styles.line}>
                      • {li.productName} × {li.quantity}
                    </Text>
                  ))}
                  {canCancelOrder(detail) ? (
                    <Pressable
                      style={styles.btnDanger}
                      disabled={cancelSubmitting}
                      onPress={confirmCancelOrder}
                    >
                      <Text style={styles.btnDangerText}>{cancelSubmitting ? 'Đang xử lý…' : 'Hủy đơn (chờ giao)'}</Text>
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
  mainTabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8 },
  mainTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center'
  },
  mainTabLeft: { marginRight: 8 },
  mainTabOn: { backgroundColor: '#1e293b' },
  mainTabText: { fontWeight: '600', color: '#475569' },
  mainTabTextOn: { color: '#fff' },
  tabPanel: { flex: 1, minHeight: 0 },
  tabList: { flex: 1, marginHorizontal: 12 },
  listContent: { paddingBottom: 24, flexGrow: 1 },
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
  filterBlock: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 4
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6
  },
  chipRow: { maxHeight: 40 },
  chipScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
    flexGrow: 0
  },
  chipSm: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 6
  },
  chipSmText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipOn: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  chipTextOn: { color: '#fff' },
  hintInline: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  shipperListHeader: { paddingHorizontal: 4, paddingBottom: 12 },
  shipperListTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  shipperListSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  shipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  shipCardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  shipAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  shipCardMain: { flex: 1, minWidth: 0 },
  shipNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  shipCardName: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginRight: 8, flexShrink: 1 },
  activityPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  activityPillOn: { backgroundColor: '#dcfce7' },
  activityPillOff: { backgroundColor: '#f1f5f9' },
  activityPillText: { fontSize: 11, fontWeight: '700' },
  activityPillTextOn: { color: '#15803d' },
  activityPillTextOff: { color: '#64748b' },
  shipPhoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  shipPhone: { fontSize: 14, color: '#475569', marginLeft: 6 },
  shipStatRow: { flexDirection: 'row', marginTop: 12 },
  shipStatBox: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8
  },
  shipStatBoxSp: { marginRight: 8 },
  shipStatLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', letterSpacing: 0.5 },
  shipStatVal: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  orderBadges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  orderCode: { fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  miniPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 6, marginBottom: 4 },
  miniPillText: { fontSize: 11, fontWeight: '700' },
  orderName: { fontSize: 14, color: '#334155' },
  orderCus: { fontSize: 13, color: '#64748b', marginTop: 2 },
  orderDate: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  orderActions: { flexDirection: 'row', marginTop: 10 },
  btnGhost: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    marginRight: 8
  },
  btnGhostText: { fontWeight: '700', color: '#334155' },
  btnPrimarySm: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center'
  },
  btnPrimarySmText: { fontWeight: '700', color: '#fff' },
  emptySm: { textAlign: 'center', color: '#94a3b8', paddingVertical: 12, fontSize: 13 },
  errInline: { paddingHorizontal: 16, marginBottom: 6 },
  errText: { color: '#b91c1c', fontSize: 13 },
  link: { color: '#2563eb', fontWeight: '600', marginTop: 4 },
  footerPad: { paddingVertical: 12, alignItems: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '70%'
  },
  sheetLg: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '88%'
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  sheetSub: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  pickRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  pickName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  pickSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  pickMeta: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  btnGhostWide: { marginTop: 12, paddingVertical: 12, alignItems: 'center' },
  k: { fontSize: 12, color: '#64748b', marginTop: 8 },
  v: { fontSize: 15, color: '#0f172a' },
  line: { fontSize: 14, color: '#334155', marginTop: 4 },
  btnDanger: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    alignItems: 'center'
  },
  btnDangerText: { fontWeight: '700', color: '#b91c1c' }
})
