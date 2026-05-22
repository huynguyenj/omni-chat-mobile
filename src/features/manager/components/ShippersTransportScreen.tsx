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

const SHIPPER_PAGE_SIZE = 9
const ORDER_PENDING_PAGE_SIZE = 6

type MainTab = 'orders' | 'shippers'

export default function ShippersTransportScreen() {
  const [mainTab, setMainTab] = useState<MainTab>('orders')
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

  const [selectedShipperByOrder, setSelectedShipperByOrder] = useState<Record<string, string>>({})
  const [pickShipperOrderId, setPickShipperOrderId] = useState<string | null>(null)

  const [detailId, setDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ManagerOrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchShippersPage = useCallback(async (page: number, reset: boolean) => {
    const res = await ManagerShipperApi.getShippers({ pageIndex: page, pageSize: SHIPPER_PAGE_SIZE })
    const m = res.meta
    setShipperMeta({ total_pages: m.total_pages ?? 1, current_page: m.current_page ?? page })
    setShippers((prev) => (reset ? res.items : [...prev, ...res.items]))
  }, [])

  const shipperKpi = useMemo(() => {
    let active = 0
    let shipping = 0
    let delivered = 0
    for (const s of shippers) {
      if (String(s.shipperStatus ?? '').toLowerCase() === 'online') active += 1
      shipping += Number(s.deliveringCount ?? 0)
      delivered += Number(s.deliveredCount ?? 0)
    }
    return { active, shipping, delivered }
  }, [shippers])

  const fetchOrdersPage = useCallback(async (pageNumber: number, reset: boolean) => {
    const res = await ManagerOrderApi.getOrders({
      pageNumber,
      pageSize: ORDER_PENDING_PAGE_SIZE,
      orderStatuses: ['Pending'],
      sortBy: 'orderdate',
      descending: true
    })
    const pendingOnly = res.items.filter((o) => String(o.status ?? '').trim().toLowerCase() === 'pending')
    const m = res.meta
    setOrderMeta({ total_pages: m.total_pages ?? 1, current_page: m.current_page ?? pageNumber })
    setOrders((prev) => (reset ? pendingOnly : [...prev, ...pendingOnly]))
  }, [])

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
          const msg = typeof e === 'string' ? e : 'Không tải đơn.'
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

  const reloadShippers = useCallback(async () => {
    setShippers([])
    await fetchShippersPage(1, true)
  }, [fetchShippersPage])

  const reloadOrders = useCallback(async () => {
    setOrders([])
    await fetchOrdersPage(1, true)
  }, [fetchOrdersPage])

  const onRefreshShippers = useCallback(async () => {
    setShipperRefreshing(true)
    setShipperError(null)
    try {
      await reloadShippers()
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Làm mới shipper thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setShipperRefreshing(false)
    }
  }, [reloadShippers])

  const onRefreshOrders = useCallback(async () => {
    setOrderRefreshing(true)
    setOrderError(null)
    try {
      await reloadOrders()
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Làm mới đơn thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setOrderRefreshing(false)
    }
  }, [reloadOrders])

  const onLoadMoreShippers = useCallback(async () => {
    if (shipperLoading || shipperLoadingMore || shipperRefreshing) return
    if (shipperMeta.current_page >= shipperMeta.total_pages) return
    const next = shipperMeta.current_page + 1
    setShipperLoadingMore(true)
    try {
      await fetchShippersPage(next, false)
    } catch {
      Toast.show({ type: 'error', text1: 'Không tải thêm shipper.' })
    } finally {
      setShipperLoadingMore(false)
    }
  }, [shipperLoading, shipperLoadingMore, shipperRefreshing, shipperMeta, fetchShippersPage])

  const onLoadMoreOrders = useCallback(async () => {
    if (orderLoading || orderLoadingMore || orderRefreshing) return
    if (orderMeta.current_page >= orderMeta.total_pages) return
    const next = orderMeta.current_page + 1
    setOrderLoadingMore(true)
    try {
      await fetchOrdersPage(next, false)
    } catch {
      Toast.show({ type: 'error', text1: 'Không tải thêm đơn.' })
    } finally {
      setOrderLoadingMore(false)
    }
  }, [orderLoading, orderLoadingMore, orderRefreshing, orderMeta, fetchOrdersPage])

  const openDetail = useCallback(async (orderId: string) => {
    setDetailId(orderId)
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
            await reloadOrders()
            await reloadShippers()
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

  const assignOne = async (orderId: string) => {
    const sid = selectedShipperByOrder[orderId]
    if (!sid) {
      Toast.show({ type: 'info', text1: 'Chọn shipper trước khi gán.' })
      return
    }
    try {
      await ManagerShipperApi.assignOrderToShipper(sid, orderId)
      Toast.show({ type: 'success', text1: 'Đã gán shipper cho đơn.' })
      setSelectedShipperByOrder((prev) => {
        const n = { ...prev }
        delete n[orderId]
        return n
      })
      await reloadOrders()
      await reloadShippers()
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Gán shipper thất bại.'
      Toast.show({ type: 'error', text1: msg })
    }
  }

  const shipperListHeader = useMemo(
    () => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh sách Shipper</Text>
        <Text style={styles.sectionSub}>Trang {shipperMeta.current_page}/{shipperMeta.total_pages}</Text>
      </View>
    ),
    [shipperMeta.current_page, shipperMeta.total_pages]
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
    const sel = selectedShipperByOrder[item.id]
    const selName = shippers.find((s) => s.id === sel)?.fullName
    return (
      <View style={styles.orderCard}>
        <Pressable onPress={() => openDetail(item.id)}>
          <View style={styles.orderTop}>
            <Text style={styles.orderCode}>{item.code || item.id}</Text>
          </View>
          <View style={styles.orderStatusRow}>
            <View style={styles.statusCol}>
              <Text style={styles.orderStatusLabel}>Trạng thái đơn</Text>
              <View style={[styles.miniPill, { backgroundColor: st.bg }]}>
                <Text style={[styles.miniPillText, { color: st.color }]}>{st.label}</Text>
              </View>
            </View>
            <View style={styles.statusCol}>
              <Text style={styles.orderStatusLabel}>Trạng thái giao</Text>
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
        </Pressable>
        <View style={styles.assignRow}>
          <Pressable style={styles.btnPick} onPress={() => setPickShipperOrderId(item.id)}>
            <Text style={styles.btnPickText}>{selName ? selName : 'Chọn shipper'}</Text>
          </Pressable>
          <Pressable style={styles.btnPrimarySm} onPress={() => assignOne(item.id)}>
            <Text style={styles.btnPrimarySmText}>Gán</Text>
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
          <Text style={[styles.mainTabText, mainTab === 'orders' && styles.mainTabTextOn]}>Đơn chờ giao</Text>
        </Pressable>
        <Pressable onPress={() => setMainTab('shippers')} style={[styles.mainTab, mainTab === 'shippers' && styles.mainTabOn]}>
          <Text style={[styles.mainTabText, mainTab === 'shippers' && styles.mainTabTextOn]}>Shipper</Text>
        </Pressable>
      </View>

      {mainTab === 'orders' ? (
        <View style={styles.ordersPane}>
          <Text style={styles.filterHint}>Chỉ hiển thị đơn chờ giao (Pending).</Text>
          {orderError ? (
            <View style={styles.errBox}>
              <Text style={styles.errText}>{orderError}</Text>
              <Pressable onPress={onRefreshOrders}>
                <Text style={styles.link}>Thử lại</Text>
              </Pressable>
            </View>
          ) : null}
          {orderLoading && orders.length === 0 ? (
            <ActivityIndicator style={{ marginTop: 24 }} />
          ) : (
            <FlatList
              style={styles.orderList}
              data={orders}
              keyExtractor={(o) => o.id}
              renderItem={renderOrder}
              contentContainerStyle={styles.listPad}
              refreshControl={<RefreshControl refreshing={orderRefreshing} onRefresh={onRefreshOrders} />}
              ListEmptyComponent={<Text style={styles.emptySm}>Không có đơn chờ giao.</Text>}
              onEndReached={onLoadMoreOrders}
              onEndReachedThreshold={0.35}
              ListFooterComponent={
                orderMeta.current_page < orderMeta.total_pages ? (
                  <View style={styles.footerPad}>{orderLoadingMore ? <ActivityIndicator /> : null}</View>
                ) : null
              }
            />
          )}
        </View>
      ) : (
        <>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiVal}>{shipperKpi.active}</Text>
              <Text style={styles.kpiLabel}>Shipper online</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiVal}>{shipperKpi.shipping}</Text>
              <Text style={styles.kpiLabel}>Đang giao</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiVal}>{shipperKpi.delivered}</Text>
              <Text style={styles.kpiLabel}>Đã giao</Text>
            </View>
          </View>
          {shipperError ? (
            <View style={styles.errBox}>
              <Text style={styles.errText}>{shipperError}</Text>
              <Pressable onPress={onRefreshShippers}>
                <Text style={styles.link}>Thử lại</Text>
              </Pressable>
            </View>
          ) : null}
          {shipperLoading && shippers.length === 0 ? (
            <ActivityIndicator style={{ marginTop: 24 }} />
          ) : (
            <FlatList
              data={shippers}
              keyExtractor={(s) => s.id}
              renderItem={renderShipper}
              ListHeaderComponent={shipperListHeader}
              contentContainerStyle={styles.listPad}
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

      <Modal visible={!!pickShipperOrderId} transparent animationType="fade" onRequestClose={() => setPickShipperOrderId(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPickShipperOrderId(null)}>
          <Pressable style={styles.sheetSm} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Chọn shipper</Text>
            <FlatList
              data={shippers}
              keyExtractor={(s) => s.id}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.pickRow}
                  onPress={() => {
                    if (!pickShipperOrderId) return
                    setSelectedShipperByOrder((prev) => ({ ...prev, [pickShipperOrderId]: item.id }))
                    setPickShipperOrderId(null)
                  }}
                >
                  <Text style={styles.pickName}>{item.fullName}</Text>
                  <Text style={styles.pickMeta}>
                    {shipperActivityPill(item).label}
                    {item.phone ? ` · ${item.phone}` : ''}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={<Text style={styles.emptySm}>Chưa tải shipper.</Text>}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!detailId} transparent animationType="slide" onRequestClose={closeDetail}>
        <Pressable style={styles.backdrop} onPress={closeDetail}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <ScrollView>
              <Text style={styles.sheetTitle}>Chi tiết đơn</Text>
              {detailLoading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
              {detailError ? <Text style={styles.errText}>{detailError}</Text> : null}
              {detail ? (
                <>
                  <Text style={styles.k}>Trạng thái đơn</Text>
                  <View style={[styles.orderBadges, styles.detailBadges]}>
                    <View style={[styles.miniPill, { backgroundColor: orderStatusPill(detail.status).bg }]}>
                      <Text style={[styles.miniPillText, { color: orderStatusPill(detail.status).color }]}>
                        {orderStatusPill(detail.status).label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.k}>Trạng thái giao</Text>
                  <View style={[styles.orderBadges, styles.detailBadges]}>
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
                  <Text style={styles.k}>Tổng</Text>
                  <Text style={styles.v}>{detail.totalAmount?.toLocaleString('vi-VN')} đ</Text>
                  <Text style={styles.k}>Dòng hàng</Text>
                  {(detail.orderItems ?? []).map((li) => (
                    <Text key={li.id} style={styles.line}>
                      • {li.productName} × {li.quantity}
                    </Text>
                  ))}
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
  kpiRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center'
  },
  kpiVal: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  kpiLabel: { fontSize: 10, color: '#64748b', marginTop: 4, textAlign: 'center' },
  orderList: { flex: 1 },
  ordersPane: { flex: 1 },
  filterBlock: { paddingHorizontal: 16, marginTop: 4, marginBottom: 8 },
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
  filterHint: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 6,
    textAlign: 'center',
    alignSelf: 'stretch'
  },
  mainTabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 10, backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4 },
  mainTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  mainTabLeft: { marginRight: 4 },
  mainTabOn: { backgroundColor: '#fff' },
  mainTabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  mainTabTextOn: { color: '#0f172a' },
  listPad: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionHeader: { paddingHorizontal: 4, paddingBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  sectionSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  shipCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  shipCardTop: { flexDirection: 'row' },
  shipAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0369a1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shipCardMain: { flex: 1, marginLeft: 12 },
  shipNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  shipCardName: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0f172a' },
  activityPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activityPillOn: { backgroundColor: '#dcfce7' },
  activityPillOff: { backgroundColor: '#f1f5f9' },
  activityPillText: { fontSize: 11, fontWeight: '700' },
  activityPillTextOn: { color: '#15803d' },
  activityPillTextOff: { color: '#64748b' },
  shipPhoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  shipPhone: { fontSize: 13, color: '#64748b' },
  shipStatRow: { flexDirection: 'row', marginTop: 12 },
  shipStatBox: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 10, padding: 10, alignItems: 'center' },
  shipStatBoxSp: { marginRight: 8 },
  shipStatLabel: { fontSize: 10, fontWeight: '700', color: '#64748b' },
  shipStatVal: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginTop: 4 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderCode: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  orderStatusRow: { flexDirection: 'row', marginTop: 12, gap: 12 },
  statusCol: { flex: 1, minWidth: 0 },
  orderStatusLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 6, letterSpacing: 0.2 },
  orderBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  detailBadges: { marginTop: 2 },
  miniPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  miniPillText: { fontSize: 11, fontWeight: '700' },
  orderName: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginTop: 8 },
  orderCus: { fontSize: 13, color: '#64748b', marginTop: 4 },
  orderDate: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  assignRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  btnPick: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'center'
  },
  btnPickText: { fontSize: 13, color: '#334155' },
  btnPrimarySm: { backgroundColor: '#0369a1', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  btnPrimarySmText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  errBox: { marginHorizontal: 16, padding: 12, backgroundColor: '#fef2f2', borderRadius: 10, marginBottom: 8 },
  errText: { color: '#b91c1c', fontSize: 13 },
  link: { color: '#0369a1', marginTop: 8, fontWeight: '600' },
  emptySm: { textAlign: 'center', color: '#64748b', marginTop: 24 },
  footerPad: { paddingVertical: 16, alignItems: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '88%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24
  },
  sheetSm: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 40,
    borderRadius: 16,
    padding: 16,
    maxHeight: '70%'
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  pickRow: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e2e8f0' },
  pickName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  pickMeta: { fontSize: 12, color: '#64748b', marginTop: 4 },
  k: { fontSize: 12, color: '#64748b', marginTop: 10 },
  v: { fontSize: 15, color: '#0f172a', marginTop: 2 },
  line: { fontSize: 14, color: '#334155', marginTop: 4 },
  btnDanger: {
    marginTop: 16,
    backgroundColor: '#b91c1c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  btnDangerText: { color: '#fff', fontWeight: '700', fontSize: 15 }
})
