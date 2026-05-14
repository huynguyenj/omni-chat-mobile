import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { CheckCircle2, Clock3, Receipt, RefreshCw, TrendingDown, TrendingUp, XCircle } from 'lucide-react-native'
import Card from '@/components/ui/cards/Card'
import { InvoiceApi } from '../../api/invoice-api'
import { OrderApi } from '../../api/order-api'
import type { AdminOrderDetail, AdminOrderItem, OrderDashboardMonthRow } from '../../types/order-type'
import type { TotalRevenue } from '../../types/invoice-type'
import { extractArrayFromResponse, isApiSuccessLike } from '../../utils/api-helpers'
import { notifyError, notifyInfo } from '../../utils/notify'

type RevenueOrderStatusFilter =
  | 'all'
  | 'Draft'
  | 'Pending'
  | 'Shipped'
  | 'Completed'
  | 'Cancelled'
  | 'PendingReturn'
  | 'Returned'
  | 'ReturnedDefective'

const STATUS_FILTERS: Array<{ value: RevenueOrderStatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Draft', label: 'Bán nhập' },
  { value: 'Pending', label: 'Cho xử lý' },
  { value: 'Shipped', label: 'Đã giao' },
  { value: 'Completed', label: 'Hoàn thành' },
  { value: 'Cancelled', label: 'Đã hủy' },
  { value: 'PendingReturn', label: 'Cho trả' },
  { value: 'Returned', label: 'Đã trả' },
  { value: 'ReturnedDefective', label: 'Trả lời' }
]

function normalizeRevenueInput(value: string): string | null {
  const trimmed = value.trim()
  if (/^\d{4}$/.test(trimmed)) return trimmed

  const monthYearMatch = /^(\d{1,2})\/(\d{4})$/.exec(trimmed)
  if (!monthYearMatch) return null

  const month = Number(monthYearMatch[1])
  if (month < 1 || month > 12) return null

  return `${String(month).padStart(2, '0')}/${monthYearMatch[2]}`
}

function extractRevenueRowsFromResponse(response: unknown): TotalRevenue[] {
  const rows = extractArrayFromResponse(response)
  return rows.map((item) => {
    const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
    return {
      month: String(row.month ?? row.Month ?? ''),
      totalAmount: Number(row.totalAmount ?? row.total_amount ?? row.totalamount ?? 0)
    }
  })
}

function extractOrderDashboardRowsFromResponse(response: unknown): OrderDashboardMonthRow[] {
  return extractArrayFromResponse(response) as OrderDashboardMonthRow[]
}

function sumOrderStatus(rows: OrderDashboardMonthRow[], statusLabel: string): number {
  const target = statusLabel.toLowerCase()
  return rows.reduce((sum, row) => {
    const statuses = Array.isArray(row.status) ? row.status : []
    const matched = statuses.find((item) => String(item.status ?? '').toLowerCase() === target)
    return sum + Number(matched?.count ?? 0)
  }, 0)
}

function readString(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

function mapApiOrderItem(raw: unknown): AdminOrderItem {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const customer = o.customer && typeof o.customer === 'object' ? (o.customer as Record<string, unknown>) : {}
  return {
    id: String(o.id ?? ''),
    customerId: String(o.customerId ?? o.customer_id ?? ''),
    customerName:
      readString(o, ['customerName', 'customer_name', 'nameCustomer', 'customerFullName']) ??
      readString(customer, ['name', 'fullName']),
    orderDate: String(o.orderDate ?? o.order_date ?? ''),
    name: String(o.name ?? ''),
    status: String(o.status ?? ''),
    totalAmount: Number(o.totalAmount ?? o.total_amount ?? 0),
    deliveryStatus: String(o.deliveryStatus ?? o.delivery_status ?? ''),
    code: String(o.code ?? '')
  }
}

function mapApiOrderDetail(raw: unknown): AdminOrderDetail {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const customer = o.customer && typeof o.customer === 'object' ? (o.customer as Record<string, unknown>) : {}
  const orderItemsRaw = Array.isArray(o.orderItems) ? o.orderItems : []

  return {
    id: String(o.id ?? ''),
    customerId: String(o.customerId ?? o.customer_id ?? ''),
    customerName:
      readString(o, ['customerName', 'customer_name', 'nameCustomer', 'customerFullName']) ??
      readString(customer, ['name', 'fullName']),
    customerPhone:
      readString(o, ['customerPhone', 'customer_phone', 'customerPhoneNumber', 'phone', 'phoneNumber']) ??
      readString(customer, ['phone', 'phoneNumber', 'customerPhoneNumber']),
    customerEmail: readString(o, ['customerEmail', 'customer_email', 'email']) ?? readString(customer, ['email']),
    customerAddress:
      readString(o, ['customerAddress', 'customer_address', 'address', 'shippingAddress']) ??
      readString(customer, ['address', 'shippingAddress']),
    orderDate: String(o.orderDate ?? o.order_date ?? ''),
    name: String(o.name ?? ''),
    status: String(o.status ?? ''),
    totalAmount: Number(o.totalAmount ?? o.total_amount ?? 0),
    deliveryStatus: String(o.deliveryStatus ?? o.delivery_status ?? ''),
    code: String(o.code ?? ''),
    orderItems: orderItemsRaw.map((itemRaw) => {
      const item = itemRaw && typeof itemRaw === 'object' ? (itemRaw as Record<string, unknown>) : {}
      return {
        id: String(item.id ?? ''),
        quantity: Number(item.quantity ?? 0),
        productName: String(item.productName ?? item.product_name ?? ''),
        itemsPrice: typeof item.itemsPrice === 'number' ? item.itemsPrice : null
      }
    })
  }
}

function revenueOrderMatchesStatus(filter: RevenueOrderStatusFilter, apiStatus: string): boolean {
  if (filter === 'all') return true
  return apiStatus.trim().toLowerCase() === filter.toLowerCase()
}

function statusBadge(statusRaw: string) {
  const normalized = String(statusRaw).trim().toLowerCase().replace(/\s+/g, '')
  switch (normalized) {
    case 'draft':
      return { text: 'Ban nhap', bg: '#6B7280' }
    case 'pending':
      return { text: 'Cho xu ly', bg: '#F59E0B' }
    case 'shipped':
      return { text: 'Da giao', bg: '#3366CC' }
    case 'completed':
      return { text: 'Hoan thanh', bg: '#2ECC71' }
    case 'cancelled':
      return { text: 'Da huy', bg: '#F44336' }
    case 'pendingreturn':
      return { text: 'Cho tra', bg: '#FB923C' }
    case 'returned':
      return { text: 'Da tra', bg: '#64748B' }
    case 'returneddefective':
      return { text: 'Tra loi', bg: '#92400E' }
    default:
      return { text: statusRaw || 'Unknown', bg: '#94A3B8' }
  }
}

export default function RevenueTab() {
  const ORDERS_PER_PAGE = 8

  const [revenueOrderStatusFilter, setRevenueOrderStatusFilter] = useState<RevenueOrderStatusFilter>('Pending')
  const [summaryPeriodInput, setSummaryPeriodInput] = useState('2026')
  const [summaryAppliedPeriod, setSummaryAppliedPeriod] = useState('2026')

  const [totalRevenueAmount, setTotalRevenueAmount] = useState(0)
  const [totalRevenueLoading, setTotalRevenueLoading] = useState(false)
  const [totalUnpaidAmount, setTotalUnpaidAmount] = useState(0)
  const [totalUnpaidLoading, setTotalUnpaidLoading] = useState(false)
  const [cancelledOrdersAmount, setCancelledOrdersAmount] = useState(0)
  const [cancelledOrdersLoading, setCancelledOrdersLoading] = useState(false)
  const [completedOrdersAmount, setCompletedOrdersAmount] = useState(0)
  const [completedOrdersLoading, setCompletedOrdersLoading] = useState(false)
  const [returnedOrdersAmount, setReturnedOrdersAmount] = useState(0)
  const [returnedOrdersLoading, setReturnedOrdersLoading] = useState(false)

  const [apiOrders, setApiOrders] = useState<AdminOrderItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersPage, setOrdersPage] = useState(1)

  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false)
  const [orderDetailLoading, setOrderDetailLoading] = useState(false)
  const [orderDetail, setOrderDetail] = useState<AdminOrderDetail | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true)
      try {
        const response = await OrderApi.getOrders(1, 1000)
        const items = extractArrayFromResponse(response)
        setApiOrders(items.map(mapApiOrderItem))
      } catch {
        notifyError('Không tải được danh sách đơn hàng.')
      } finally {
        setOrdersLoading(false)
      }
    }
    void fetchOrders()
  }, [])

  const fetchTotalRevenueData = useCallback(async (rawInput: string) => {
    const normalizedInput = normalizeRevenueInput(rawInput)
    if (!normalizedInput) return
    setTotalRevenueLoading(true)

    try {
      const response = await InvoiceApi.getTotalRevenue(normalizedInput)
      const rows = extractRevenueRowsFromResponse(response)
      if (!isApiSuccessLike(response) && rows.length === 0) {
        setTotalRevenueAmount(0)
        return
      }
      setTotalRevenueAmount(rows.reduce((sum, item) => sum + item.totalAmount, 0))
    } catch {
      setTotalRevenueAmount(0)
      notifyError('Không tải được tổng doanh thu.')
    } finally {
      setTotalRevenueLoading(false)
    }
  }, [])

  const fetchTotalUnpaidData = useCallback(async (rawInput: string) => {
    const normalizedInput = normalizeRevenueInput(rawInput)
    if (!normalizedInput) return
    setTotalUnpaidLoading(true)

    try {
      const response = await InvoiceApi.getTotalUnpaid(normalizedInput)
      const rows = extractRevenueRowsFromResponse(response)
      if (!isApiSuccessLike(response) && rows.length === 0) {
        setTotalUnpaidAmount(0)
        return
      }
      setTotalUnpaidAmount(rows.reduce((sum, item) => sum + item.totalAmount, 0))
    } catch {
      setTotalUnpaidAmount(0)
      notifyError('Không tải được tổng cho thanh toán.')
    } finally {
      setTotalUnpaidLoading(false)
    }
  }, [])

  const fetchOrderSummaryData = useCallback(async (rawInput: string) => {
    const normalizedInput = normalizeRevenueInput(rawInput)
    if (!normalizedInput) return

    setCancelledOrdersLoading(true)
    setCompletedOrdersLoading(true)
    setReturnedOrdersLoading(true)

    try {
      const response = await OrderApi.getOrderDashboard(normalizedInput)
      const rows = extractOrderDashboardRowsFromResponse(response)
      if (!isApiSuccessLike(response) && rows.length === 0) {
        setCancelledOrdersAmount(0)
        setCompletedOrdersAmount(0)
        setReturnedOrdersAmount(0)
        return
      }
      setCancelledOrdersAmount(sumOrderStatus(rows, 'Cancelled'))
      setCompletedOrdersAmount(sumOrderStatus(rows, 'Completed'))
      setReturnedOrdersAmount(sumOrderStatus(rows, 'Returned'))
    } catch {
      setCancelledOrdersAmount(0)
      setCompletedOrdersAmount(0)
      setReturnedOrdersAmount(0)
      notifyError('Không tải được tổng hợp đơn hàng.')
    } finally {
      setCancelledOrdersLoading(false)
      setCompletedOrdersLoading(false)
      setReturnedOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTotalRevenueData('2026')
    void fetchTotalUnpaidData('2026')
    void fetchOrderSummaryData('2026')
  }, [fetchOrderSummaryData, fetchTotalRevenueData, fetchTotalUnpaidData])

  const applySummaryPeriod = useCallback(
    (rawInput: string) => {
      const normalizedInput = normalizeRevenueInput(rawInput)
      if (!normalizedInput) {
        notifyInfo('Nhập đúng định dạng yyyy hoặc mm/yyyy')
        return
      }
      setSummaryPeriodInput(normalizedInput)
      setSummaryAppliedPeriod(normalizedInput)
      void fetchTotalRevenueData(normalizedInput)
      void fetchTotalUnpaidData(normalizedInput)
      void fetchOrderSummaryData(normalizedInput)
    },
    [fetchOrderSummaryData, fetchTotalRevenueData, fetchTotalUnpaidData]
  )

  const filteredOrders = useMemo(() => {
    const list = apiOrders.filter((o) => revenueOrderMatchesStatus(revenueOrderStatusFilter, o.status))
    return [...list].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
  }, [apiOrders, revenueOrderStatusFilter])

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE))
  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ORDERS_PER_PAGE
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE)
  }, [filteredOrders, ordersPage])

  useEffect(() => {
    setOrdersPage(1)
  }, [revenueOrderStatusFilter])

  useEffect(() => {
    if (ordersPage > totalOrderPages) setOrdersPage(totalOrderPages)
  }, [ordersPage, totalOrderPages])

  const openOrderDetail = (order: AdminOrderItem) => {
    if (!order.id) return
    setOrderDetailModalOpen(true)
    setOrderDetailLoading(true)
    setOrderDetail(null)

    void OrderApi.getOrderById(order.id)
      .then((res) => {
        if (!res.is_success) {
          notifyError(res.message || 'Không tải được chi tiết đơn hàng.')
          return
        }
        setOrderDetail(mapApiOrderDetail(res.data))
      })
      .catch(() => {
        notifyError('Không tải được chi tiết đơn hàng.')
      })
      .finally(() => setOrderDetailLoading(false))
  }

  const closeOrderDetailModal = () => {
    setOrderDetailModalOpen(false)
    setOrderDetail(null)
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <Text style={styles.filterText}>Kỳ lọc: {summaryAppliedPeriod}</Text>
        <TextInput
          value={summaryPeriodInput}
          onChangeText={setSummaryPeriodInput}
          placeholder="yyyy hoac mm/yyyy"
          placeholderTextColor="#9CA3AF"
          style={styles.filterInput}
        />
        <TouchableOpacity style={styles.filterBtn} onPress={() => applySummaryPeriod(summaryPeriodInput)}>
          <Text style={styles.filterBtnText}>Lấy</Text> 
        </TouchableOpacity>
      </View>

      <View style={styles.grid2}>
        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Receipt size={18} color="#2ECC71" />
            <Text style={styles.cardTitle}>Tổng doanh thu</Text>
          </View>
          {totalRevenueLoading ? (
            <ActivityIndicator color="#2ECC71" />
          ) : (
            <Text style={styles.cardValueMoney}>{Math.round(totalRevenueAmount / 1000).toLocaleString('vi-VN')}K</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Clock3 size={18} color="#FF9800" />
            <Text style={styles.cardTitle}>Cho thanh toán</Text>
          </View>
          {totalUnpaidLoading ? (
            <ActivityIndicator color="#FF9800" />
          ) : (
            <Text style={styles.cardValueMoney}>{Math.round(totalUnpaidAmount / 1000).toLocaleString('vi-VN')}K</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <XCircle size={18} color="#F44336" />
            <Text style={styles.cardTitle}>Đơn hủy</Text>
          </View>
          {cancelledOrdersLoading ? (
            <ActivityIndicator color="#F44336" />
          ) : (
            <Text style={styles.cardValue}>{cancelledOrdersAmount.toLocaleString('vi-VN')}</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <CheckCircle2 size={18} color="#3366CC" />
            <Text style={styles.cardTitle}>Đơn hoàn thành</Text>
          </View>
          {completedOrdersLoading ? (
            <ActivityIndicator color="#3366CC" />
          ) : (
            <Text style={styles.cardValue}>{completedOrdersAmount.toLocaleString('vi-VN')}</Text>
          )}
        </Card>

        <Card style={styles.cardFull}>
          <View style={styles.cardTitleRow}>
            <RefreshCw size={18} color="#8B5CF6" />
            <Text style={styles.cardTitle}>Đơn trả về</Text>
          </View>
          {returnedOrdersLoading ? (
            <ActivityIndicator color="#8B5CF6" />
          ) : (
            <Text style={styles.cardValue}>{returnedOrdersAmount.toLocaleString('vi-VN')}</Text>
          )}
        </Card>
      </View>

      <Card style={styles.block}>
        <Text style={styles.blockTitle}>Chi tiết đơn hàng ({filteredOrders.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
          {STATUS_FILTERS.map((item) => {
            const active = item.value === revenueOrderStatusFilter
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setRevenueOrderStatusFilter(item.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {ordersLoading ? (
          <ActivityIndicator color="#3366CC" />
        ) : (
          <View style={styles.orderList}>
            {paginatedOrders.map((order) => {
              const badge = statusBadge(order.status)
              return (
                <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => openOrderDetail(order)}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderCode}>{order.code || order.id.slice(0, 8)}</Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={styles.badgeText}>{badge.text}</Text>
                    </View>
                  </View>
                  <Text style={styles.orderName} numberOfLines={1}>
                    {order.name}
                  </Text>
                  <Text style={styles.orderMeta} numberOfLines={1}>
                    KH: {order.customerName || order.customerId}
                  </Text>
                  <Text style={styles.orderAmount}>{order.totalAmount.toLocaleString('vi-VN')}d</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        <View style={styles.pager}>
          <TouchableOpacity
            disabled={ordersPage === 1}
            onPress={() => setOrdersPage((p) => Math.max(1, p - 1))}
            style={[styles.pagerBtn, ordersPage === 1 && styles.btnDisabled]}
          >
            <Text style={styles.pagerText}>Trước</Text>
          </TouchableOpacity>
          <Text style={styles.pageLabel}>Trang {ordersPage}/{totalOrderPages}</Text>
          <TouchableOpacity
            disabled={ordersPage === totalOrderPages}
            onPress={() => setOrdersPage((p) => Math.min(totalOrderPages, p + 1))}
            style={[styles.pagerBtn, ordersPage === totalOrderPages && styles.btnDisabled]}
          >
            <Text style={styles.pagerText}>Tiếp</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Modal visible={orderDetailModalOpen} transparent animationType="slide" onRequestClose={closeOrderDetailModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBody}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
              <TouchableOpacity onPress={closeOrderDetailModal} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>Đóng</Text>
              </TouchableOpacity>
            </View>

            {orderDetailLoading && <ActivityIndicator color="#3366CC" />}
            {!orderDetailLoading && orderDetail && (
              <ScrollView>
                <Text style={styles.detailRow}>Ma: {orderDetail.code}</Text>
                <Text style={styles.detailRow}>Tên: {orderDetail.name}</Text>
                <Text style={styles.detailRow}>Khach hang: {orderDetail.customerName || orderDetail.customerId}</Text>
                <Text style={styles.detailRow}>Trạng thái: {orderDetail.status}</Text>
                <Text style={styles.detailRow}>Tổng tiền: {orderDetail.totalAmount.toLocaleString('vi-VN')}d</Text>
                <Text style={styles.detailRow}>Sản phẩm:</Text>
                {orderDetail.orderItems.map((item) => (
                  <Text key={item.id} style={styles.detailSubRow}>
                    - {item.productName} x{item.quantity} ({item.itemsPrice?.toLocaleString('vi-VN') ?? 'N/A'}d)
                  </Text>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  filterText: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  filterInput: {
    height: 38,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    minWidth: 130,
    color: '#111827',
    backgroundColor: '#fff'
  },
  filterBtn: { backgroundColor: '#3366CC', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9 },
  filterBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '48%', minWidth: 150 },
  cardFull: { width: '100%' },
  cardTitleRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#374151', fontWeight: '600', fontSize: 13 },
  cardValue: { color: '#003366', fontSize: 22, fontWeight: '700' },
  cardValueMoney: { color: '#003366', fontSize: 22, fontWeight: '700' },
  block: { paddingVertical: 14 },
  blockTitle: { fontSize: 16, color: '#003366', fontWeight: '700', marginBottom: 10 },
  filterChipsRow: { gap: 8, paddingBottom: 8 },
  chip: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  chipActive: { backgroundColor: '#3366CC', borderColor: '#3366CC' },
  chipText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  orderList: { gap: 8 },
  orderCard: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10, backgroundColor: '#fff' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderCode: { color: '#003366', fontWeight: '700' },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  orderName: { marginTop: 8, color: '#111827', fontWeight: '600' },
  orderMeta: { marginTop: 4, color: '#6B7280', fontSize: 12 },
  orderAmount: { marginTop: 6, color: '#2ECC71', fontWeight: '700' },
  pager: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pagerBtn: { backgroundColor: '#003366', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnDisabled: { opacity: 0.5 },
  pagerText: { color: '#fff', fontWeight: '600' },
  pageLabel: { color: '#6B7280', fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 16 },
  modalBody: { backgroundColor: '#fff', borderRadius: 12, padding: 14, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { color: '#003366', fontSize: 16, fontWeight: '700' },
  modalCloseBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#E2E8F0' },
  modalCloseText: { color: '#334155', fontWeight: '600' },
  detailRow: { color: '#334155', marginBottom: 8 },
  detailSubRow: { color: '#64748B', marginBottom: 6, paddingLeft: 6 }
})
