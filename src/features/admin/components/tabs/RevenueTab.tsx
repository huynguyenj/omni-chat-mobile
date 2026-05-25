import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react-native'
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Clock3,
  Copy,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  RefreshCw,
  TrendingDown,
  Truck,
  User,
  Wallet,
  XCircle
} from 'lucide-react-native'
import Card from '@/components/ui/cards/Card'
import AdminDashboardMetricCard from '../AdminDashboardMetricCard'
import { InvoiceApi } from '../../api/invoice-api'
import { OrderApi } from '../../api/order-api'
import type { AdminOrderDetail, AdminOrderItem } from '../../types/order-type'
import type { TotalRevenue } from '../../types/invoice-type'
import {
  extractArrayFromResponse,
  extractOrderDashboardRowsFromResponse,
  extractRevenueRowsFromResponse,
  isApiSuccessLike,
  isAxiosNoDataError,
  normalizePeriodInput,
  sumOrderStatus,
  unwrapOrderDetailBody
} from '../../utils/api-helpers'
import { notifyError, notifyInfo, notifySuccess } from '../../utils/notify'
import {
  getDeliveryStatusDisplay,
  getOrderStatusUi,
  REVENUE_ORDER_STATUS_FILTERS
} from '@/features/order/const/order-status'

type RevenueOrderStatusFilter = (typeof REVENUE_ORDER_STATUS_FILTERS)[number]['value']

const ORDERS_PER_PAGE = 9
const LOG_PREFIX = '[Admin/Revenue]'

function logOrderListToTerminal(
  event: string,
  meta: Record<string, string | number>,
  orders: AdminOrderItem[]
) {
  console.log(`${LOG_PREFIX} Danh sách đơn — ${event}`, meta)
  if (orders.length === 0) {
    console.log(`${LOG_PREFIX} Danh sách đơn — (trống)`)
    return
  }
  console.table(
    orders.map((order, index) => ({
      stt: index + 1,
      ma: order.code || order.id.slice(0, 8),
      id: order.id,
      khach: order.customerName || order.customerId,
      trangThai: order.status,
      tong: order.totalAmount
    }))
  )
}

function logOrderDetailToTerminal(event: string, payload: unknown) {
  console.log(`${LOG_PREFIX} Chi tiết đơn — ${event}`, payload)
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

function formatOrderDetailDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const time = d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  const date = d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  return `${time} - ${date}`
}

async function shareCopyText(label: string, value: string) {
  if (!value.trim()) return
  try {
    await Share.share({ message: value })
    notifySuccess(`Đã chia sẻ ${label}`)
  } catch {
    notifyInfo('Không thể sao chép.')
  }
}

function DetailInfoRow({
  Icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor = '#111827',
  onAction,
  ActionIcon
}: {
  Icon: LucideIcon
  iconBg: string
  iconColor: string
  label: string
  value: string
  valueColor?: string
  onAction?: () => void
  ActionIcon?: LucideIcon
}) {
  return (
    <View style={detailStyles.infoRow}>
      <View style={[detailStyles.infoIconWrap, { backgroundColor: iconBg }]}>
        <Icon size={18} color={iconColor} />
      </View>
      <View style={detailStyles.infoContent}>
        <Text style={detailStyles.infoLabel}>{label}</Text>
        <Text style={[detailStyles.infoValue, { color: valueColor }]} numberOfLines={2}>
          {value}
        </Text>
      </View>
      {onAction && ActionIcon ? (
        <TouchableOpacity style={detailStyles.infoAction} onPress={onAction} hitSlop={8}>
          <ActionIcon size={18} color="#94A3B8" />
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

function AdminOrderDetailModal({
  order,
  loading
}: {
  order: AdminOrderDetail | null
  loading: boolean
}) {
  if (loading || !order) {
    return (
      <View style={detailStyles.loadingWrap}>
        <ActivityIndicator color="#3366CC" size="large" />
        <Text style={detailStyles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    )
  }

  const statusUi = getOrderStatusUi(order.status)
  const deliveryUi = getDeliveryStatusDisplay(order.deliveryStatus)
  const phone = order.customerPhone?.trim() ?? ''

  return (
    <ScrollView style={detailStyles.scroll} contentContainerStyle={detailStyles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={detailStyles.infoCard}>
        <DetailInfoRow
          Icon={FileText}
          iconBg="#EBF1FF"
          iconColor="#3366CC"
          label="Mã đơn hàng"
          value={order.code || order.id}
          valueColor="#3366CC"
          ActionIcon={Copy}
          onAction={() => void shareCopyText('mã đơn', order.code || order.id)}
        />
        <DetailInfoRow
          Icon={User}
          iconBg="#E8F8F0"
          iconColor="#22C55E"
          label="Khách hàng"
          value={order.customerName || order.customerId || '—'}
          valueColor="#22C55E"
        />
        <DetailInfoRow
          Icon={Phone}
          iconBg="#F3E8FF"
          iconColor="#9333EA"
          label="SĐT"
          value={phone || '—'}
          valueColor="#9333EA"
          ActionIcon={Phone}
          onAction={
            phone
              ? () => {
                  void Linking.openURL(`tel:${phone}`)
                }
              : undefined
          }
        />
        <DetailInfoRow
          Icon={Mail}
          iconBg="#EBF1FF"
          iconColor="#3366CC"
          label="Email"
          value={order.customerEmail || '—'}
          valueColor="#3366CC"
          ActionIcon={Copy}
          onAction={
            order.customerEmail
              ? () => void shareCopyText('email', order.customerEmail ?? '')
              : undefined
          }
        />
        <DetailInfoRow
          Icon={MapPin}
          iconBg="#FFF3E0"
          iconColor="#FF9800"
          label="Địa chỉ"
          value={order.customerAddress || '—'}
          valueColor="#FF9800"
        />
        <DetailInfoRow
          Icon={Calendar}
          iconBg="#FFEBEE"
          iconColor="#F44336"
          label="Ngày đặt"
          value={formatOrderDetailDateTime(order.orderDate)}
          valueColor="#F44336"
        />
        <DetailInfoRow
          Icon={Clock}
          iconBg="#F3E8FF"
          iconColor="#9333EA"
          label="Trạng thái"
          value={statusUi.labelVi}
          valueColor="#9333EA"
        />
        <DetailInfoRow
          Icon={Truck}
          iconBg="#EBF1FF"
          iconColor="#3366CC"
          label="Trạng thái giao"
          value={deliveryUi.name}
          valueColor="#3366CC"
        />
      </View>

      <View style={detailStyles.totalBox}>
        <View style={detailStyles.totalIconWrap}>
          <Wallet size={22} color="#fff" />
        </View>
        <View>
          <Text style={detailStyles.totalLabel}>Tổng tiền</Text>
          <Text style={detailStyles.totalValue}>{order.totalAmount.toLocaleString('vi-VN')} đ</Text>
        </View>
      </View>

      <View style={detailStyles.productsCard}>
        <View style={detailStyles.productsHeader}>
          <View style={detailStyles.productsIconWrap}>
            <Package size={18} color="#3366CC" />
          </View>
          <Text style={detailStyles.productsTitle}>Sản phẩm</Text>
        </View>
        {order.orderItems.length > 0 ? (
          <>
            {order.orderItems.map((item) => (
              <View key={item.id} style={detailStyles.productRow}>
                <View style={detailStyles.productDot} />
                <Text style={detailStyles.productName} numberOfLines={2}>
                  {item.productName} x{item.quantity}
                </Text>
                <Text style={detailStyles.productPrice}>
                  {item.itemsPrice != null ? `${item.itemsPrice.toLocaleString('vi-VN')} đ` : '—'}
                </Text>
              </View>
            ))}
            <View style={detailStyles.productFooter}>
              <Text style={detailStyles.productFooterLabel}>Tổng cộng</Text>
              <Text style={detailStyles.productFooterValue}>
                {order.totalAmount.toLocaleString('vi-VN')} đ
              </Text>
            </View>
          </>
        ) : (
          <Text style={detailStyles.productsEmpty}>Đơn hàng chưa có sản phẩm.</Text>
        )}
      </View>
    </ScrollView>
  )
}

const detailStyles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 28, gap: 14 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoContent: { flex: 1, minWidth: 0 },
  infoLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '700' },
  infoAction: { padding: 6 },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#E8F8F0',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  totalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  totalLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#22C55E', marginTop: 2 },
  productsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  productsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  productsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBF1FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productsTitle: { fontSize: 16, fontWeight: '700', color: '#003366' },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  productDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3366CC' },
  productName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  productPrice: { fontSize: 14, fontWeight: '700', color: '#111827' },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  productFooterLabel: { fontSize: 14, fontWeight: '700', color: '#374151' },
  productFooterValue: { fontSize: 16, fontWeight: '800', color: '#3366CC' },
  productsEmpty: { color: '#9CA3AF', fontSize: 13, textAlign: 'center', paddingVertical: 12 }
})

const CHART_SLOT_MIN = 28
const CHART_SLOT_FIT_MIN = 24
const CHART_PLOT_PADDING = 80

function shortMonthLabel(month: string, index: number): string {
  const trimmed = month.trim()
  const mm = /^(\d{1,2})\/\d{4}$/.exec(trimmed)
  if (mm) return mm[1].padStart(2, '0')
  if (trimmed.length <= 5) return trimmed
  return `T${index + 1}`
}

function MonthlyLineChart({
  data,
  color,
  loading
}: {
  data: TotalRevenue[]
  color: string
  loading: boolean
}) {
  const chartHeight = 140
  const plotLayout = useMemo(() => {
    const available = Dimensions.get('window').width - CHART_PLOT_PADDING
    const count = Math.max(data.length, 1)
    const fitSlot = available / count
    const scroll = fitSlot < CHART_SLOT_FIT_MIN
    return {
      scroll,
      useFlex: !scroll,
      contentWidth: scroll ? count * CHART_SLOT_MIN : undefined,
      slotWidth: scroll ? CHART_SLOT_MIN : undefined
    }
  }, [data.length])

  const max = Math.max(...data.map((d) => d.totalAmount), 1)

  if (loading) {
    return <ActivityIndicator color={color} style={{ marginVertical: 16 }} />
  }
  if (data.length === 0) {
    return <Text style={chartStyles.empty}>Chưa có dữ liệu biểu đồ.</Text>
  }

  const plotBars = (
    <View
      style={[
        chartStyles.plot,
        { height: chartHeight },
        plotLayout.contentWidth != null ? { width: plotLayout.contentWidth } : { width: '100%' }
      ]}
    >
      {data.map((point, index) => {
        const barH = Math.max(4, (point.totalAmount / max) * (chartHeight - 28))
        return (
          <View
            key={`${point.month}-${index}`}
            style={[
              chartStyles.barCol,
              plotLayout.useFlex ? chartStyles.barColFlex : { width: plotLayout.slotWidth }
            ]}
          >
            <View style={[chartStyles.bar, { height: barH, backgroundColor: color }]} />
            <Text style={chartStyles.monthLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {shortMonthLabel(point.month, index)}
            </Text>
          </View>
        )
      })}
    </View>
  )

  return (
    <View style={chartStyles.chartWrap}>
      {plotLayout.scroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          style={[chartStyles.plotScroll, { height: chartHeight + 22 }]}
          contentContainerStyle={chartStyles.plotScrollContent}
        >
          {plotBars}
        </ScrollView>
      ) : (
        <View style={chartStyles.plotClip}>{plotBars}</View>
      )}
      <ScrollView style={chartStyles.tableWrap} nestedScrollEnabled>
        {data.map((point, index) => (
          <View key={`row-${index}`} style={chartStyles.tableRow}>
            <Text style={chartStyles.tableMonth}>{point.month}</Text>
            <Text style={chartStyles.tableAmount}>{point.totalAmount.toLocaleString('vi-VN')} đ</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const chartStyles = StyleSheet.create({
  chartWrap: { width: '100%', overflow: 'hidden' },
  plotClip: { width: '100%', overflow: 'hidden', marginBottom: 8 },
  plotScroll: { width: '100%', marginBottom: 8 },
  plotScrollContent: { flexGrow: 1 },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
    paddingHorizontal: 6
  },
  barCol: { alignItems: 'center', justifyContent: 'flex-end', minWidth: 0 },
  barColFlex: { flex: 1 },
  bar: {
    width: 8,
    maxWidth: '65%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 4
  },
  monthLabel: {
    fontSize: 8,
    color: '#6B7280',
    width: '100%',
    textAlign: 'center',
    paddingHorizontal: 1
  },
  tableWrap: { maxHeight: 120 },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  tableMonth: { color: '#374151', fontSize: 12, fontWeight: '600' },
  tableAmount: { color: '#003366', fontSize: 12, fontWeight: '700' },
  empty: { fontSize: 13, color: '#6B7280', marginVertical: 12 }
})

export default function RevenueTab() {
  const [revenueOrderStatusFilter, setRevenueOrderStatusFilter] = useState<RevenueOrderStatusFilter>('all')
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

  const [revenueChartInput, setRevenueChartInput] = useState('2026')
  const [revenueChartData, setRevenueChartData] = useState<TotalRevenue[]>([])
  const [revenueChartLoading, setRevenueChartLoading] = useState(false)

  const [unpaidChartInput, setUnpaidChartInput] = useState('2026')
  const [unpaidChartData, setUnpaidChartData] = useState<TotalRevenue[]>([])
  const [unpaidChartLoading, setUnpaidChartLoading] = useState(false)

  const [apiOrders, setApiOrders] = useState<AdminOrderItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersPage, setOrdersPage] = useState(1)

  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false)
  const [orderDetailLoading, setOrderDetailLoading] = useState(false)
  const [orderDetail, setOrderDetail] = useState<AdminOrderDetail | null>(null)

  const revenueFilterLabel = useMemo(
    () =>
      REVENUE_ORDER_STATUS_FILTERS.find((item) => item.value === revenueOrderStatusFilter)?.label ??
      revenueOrderStatusFilter,
    [revenueOrderStatusFilter]
  )

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true)
      try {
        const response = await OrderApi.getOrders(1, 1000)
        const items = extractArrayFromResponse(response)
        const mapped = items.map(mapApiOrderItem)
        setApiOrders(mapped)
        logOrderListToTerminal('tải API', { tong: mapped.length }, mapped)
      } catch (error) {
        console.error(`${LOG_PREFIX} Danh sách đơn — lỗi tải`, error)
        notifyError('Không tải được danh sách đơn hàng. Vui lòng thử lại.')
      } finally {
        setOrdersLoading(false)
      }
    }
    void fetchOrders()
  }, [])

  const fetchRevenueChartData = useCallback(async (rawInput: string) => {
    const normalizedInput = normalizePeriodInput(rawInput)
    if (!normalizedInput) {
      notifyError('Định dạng không hợp lệ. Nhập yyyy hoặc mm/yyyy.')
      return
    }
    setRevenueChartInput(normalizedInput)
    setRevenueChartLoading(true)
    try {
      const response = await InvoiceApi.getTotalRevenue(normalizedInput)
      const rows = extractRevenueRowsFromResponse(response)
      if (!isApiSuccessLike(response) && rows.length === 0) {
        setRevenueChartData([])
        notifyInfo('Không có dữ liệu doanh thu cho bộ lọc này.')
        return
      }
      setRevenueChartData(rows)
    } catch (error) {
      if (isAxiosNoDataError(error)) {
        setRevenueChartData([])
        notifyInfo('Không có dữ liệu doanh thu cho bộ lọc này.')
        return
      }
      notifyError('Không tải được dữ liệu doanh thu. Vui lòng thử lại.')
    } finally {
      setRevenueChartLoading(false)
    }
  }, [])

  const fetchUnpaidChartData = useCallback(async (rawInput: string) => {
    const normalizedInput = normalizePeriodInput(rawInput)
    if (!normalizedInput) {
      notifyError('Định dạng không hợp lệ. Nhập yyyy hoặc mm/yyyy.')
      return
    }
    setUnpaidChartInput(normalizedInput)
    setUnpaidChartLoading(true)
    try {
      const response = await InvoiceApi.getTotalUnpaid(normalizedInput)
      const rows = extractRevenueRowsFromResponse(response)
      if (!isApiSuccessLike(response) && rows.length === 0) {
        setUnpaidChartData([])
        notifyInfo('Không có dữ liệu chưa thanh toán cho bộ lọc này.')
        return
      }
      setUnpaidChartData(rows)
    } catch (error) {
      if (isAxiosNoDataError(error)) {
        setUnpaidChartData([])
        notifyInfo('Không có dữ liệu chưa thanh toán cho bộ lọc này.')
        return
      }
      notifyError('Không tải được dữ liệu chưa thanh toán. Vui lòng thử lại.')
    } finally {
      setUnpaidChartLoading(false)
    }
  }, [])

  const fetchTotalRevenueData = useCallback(async (rawInput: string) => {
    const normalizedInput = normalizePeriodInput(rawInput)
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
    } catch (error) {
      if (isAxiosNoDataError(error)) {
        setTotalRevenueAmount(0)
        return
      }
      notifyError('Không tải được tổng doanh thu. Vui lòng thử lại.')
    } finally {
      setTotalRevenueLoading(false)
    }
  }, [])

  const fetchTotalUnpaidData = useCallback(async (rawInput: string) => {
    const normalizedInput = normalizePeriodInput(rawInput)
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
      notifyError('Không tải được dữ liệu chưa thanh toán. Vui lòng thử lại.')
    } finally {
      setTotalUnpaidLoading(false)
    }
  }, [])

  const fetchOrderSummaryData = useCallback(async (rawInput: string) => {
    const normalizedInput = normalizePeriodInput(rawInput)
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
    void fetchRevenueChartData('2026')
    void fetchUnpaidChartData('2026')
  }, [
    fetchOrderSummaryData,
    fetchRevenueChartData,
    fetchTotalRevenueData,
    fetchTotalUnpaidData,
    fetchUnpaidChartData
  ])

  const applySummaryPeriod = useCallback(
    (rawInput: string) => {
      const normalizedInput = normalizePeriodInput(rawInput)
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

  useEffect(() => {
    logOrderListToTerminal(
      'trang hiện tại',
      {
        loc: revenueFilterLabel,
        trang: ordersPage,
        tongTrang: totalOrderPages,
        tongDon: filteredOrders.length
      },
      paginatedOrders
    )
  }, [filteredOrders.length, ordersPage, paginatedOrders, revenueFilterLabel, totalOrderPages])

  const openOrderDetail = (order: AdminOrderItem) => {
    if (!order.id) {
      notifyError('Không tìm thấy ID đơn hàng.')
      return
    }

    const listIndex = paginatedOrders.findIndex((o) => o.id === order.id)

    setOrderDetailModalOpen(true)
    setOrderDetailLoading(true)
    setOrderDetail(null)

    logOrderDetailToTerminal('mở modal', {
      id: order.id,
      ma: order.code,
      trangThai: order.status,
      viTriTrang: listIndex >= 0 ? listIndex + 1 : null,
      loc: revenueFilterLabel,
      trang: ordersPage,
      tongTrang: totalOrderPages
    })

    void OrderApi.getOrderById(order.id)
      .then((res) => {
        logOrderDetailToTerminal('phản hồi API (raw)', res)
        const unwrapped = unwrapOrderDetailBody(res)
        if (!unwrapped.ok) {
          console.warn(`${LOG_PREFIX} Chi tiết đơn — unwrap thất bại`, unwrapped.message)
          notifyError(unwrapped.message || 'Không tải được chi tiết đơn hàng.')
          return
        }
        const detail = mapApiOrderDetail(unwrapped.body)
        setOrderDetail(detail)
        logOrderDetailToTerminal('đã map', detail)
      })
      .catch((error) => {
        console.error(`${LOG_PREFIX} Chi tiết đơn — lỗi`, error)
        notifyError('Không tải được chi tiết đơn hàng.')
      })
      .finally(() => setOrderDetailLoading(false))
  }

  const closeOrderDetailModal = () => {
    logOrderDetailToTerminal('đóng modal', null)
    setOrderDetailModalOpen(false)
    setOrderDetail(null)
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <Text style={styles.filterText}>
          Kỳ lọc KPI: <Text style={styles.filterPeriod}>{summaryAppliedPeriod}</Text>
        </Text>
        <View style={styles.filterControls}>
          <TextInput
            value={summaryPeriodInput}
            onChangeText={setSummaryPeriodInput}
            placeholder="yyyy hoặc mm/yyyy"
            placeholderTextColor="#9CA3AF"
            style={styles.filterInput}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => applySummaryPeriod(summaryPeriodInput)}>
            <Text style={styles.filterBtnText}>Lấy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <AdminDashboardMetricCard
          accentColor="#2ECC71"
          iconBg="#E8F8F0"
          iconColor="#2ECC71"
          valueColor="#2ECC71"
          Icon={Receipt}
          title="Tổng doanh thu"
          loading={totalRevenueLoading}
          value={`${Math.round(totalRevenueAmount / 1000).toLocaleString('vi-VN')}K`}
          unit="VNĐ"
          footer={`Kỳ: ${summaryAppliedPeriod}`}
        />
        <AdminDashboardMetricCard
          accentColor="#FF9800"
          iconBg="#FFF3E0"
          iconColor="#FF9800"
          valueColor="#FF9800"
          Icon={Clock3}
          title="Tổng chưa thanh toán"
          loading={totalUnpaidLoading}
          value={`${Math.round(totalUnpaidAmount / 1000).toLocaleString('vi-VN')}K`}
          unit="VNĐ"
          footer={`Kỳ: ${summaryAppliedPeriod}`}
        />
        <AdminDashboardMetricCard
          accentColor="#F44336"
          iconBg="#FFEBEE"
          iconColor="#F44336"
          valueColor="#F44336"
          Icon={XCircle}
          title="Đơn hủy"
          loading={cancelledOrdersLoading}
          value={cancelledOrdersAmount.toLocaleString('vi-VN')}
          footer={`Kỳ: ${summaryAppliedPeriod}`}
        />
        <AdminDashboardMetricCard
          accentColor="#3366CC"
          iconBg="#EBF1FF"
          iconColor="#3366CC"
          valueColor="#3366CC"
          Icon={CheckCircle2}
          title="Đơn hoàn thành"
          loading={completedOrdersLoading}
          value={completedOrdersAmount.toLocaleString('vi-VN')}
          footer={`Kỳ: ${summaryAppliedPeriod}`}
        />
        <AdminDashboardMetricCard
          accentColor="#8B5CF6"
          iconBg="#F3E8FF"
          iconColor="#8B5CF6"
          valueColor="#8B5CF6"
          Icon={RefreshCw}
          title="Đơn trả"
          loading={returnedOrdersLoading}
          value={returnedOrdersAmount.toLocaleString('vi-VN')}
          footer={`Kỳ: ${summaryAppliedPeriod}`}
          style={{ width: '100%' }}
        />
      </View>

      <Card style={styles.block}>
        <View style={styles.chartHeader}>
          <DollarSign size={18} color="#2ECC71" />
          <Text style={styles.blockTitle}>Doanh thu theo thời gian</Text>
        </View>
        <View style={styles.inlineFilter}>
          <TextInput
            value={revenueChartInput}
            onChangeText={setRevenueChartInput}
            placeholder="yyyy hoặc mm/yyyy"
            placeholderTextColor="#9CA3AF"
            style={styles.filterInput}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => void fetchRevenueChartData(revenueChartInput)}>
            <Text style={styles.filterBtnText}>Lấy</Text>
          </TouchableOpacity>
        </View>
        <MonthlyLineChart data={revenueChartData} color="#2ECC71" loading={revenueChartLoading} />
      </Card>

      <Card style={styles.block}>
        <View style={styles.chartHeader}>
          <TrendingDown size={18} color="#FF9800" />
          <Text style={styles.blockTitle}>Chưa thanh toán theo thời gian</Text>
        </View>
        <View style={styles.inlineFilter}>
          <TextInput
            value={unpaidChartInput}
            onChangeText={setUnpaidChartInput}
            placeholder="yyyy hoặc mm/yyyy"
            placeholderTextColor="#9CA3AF"
            style={styles.filterInput}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => void fetchUnpaidChartData(unpaidChartInput)}>
            <Text style={styles.filterBtnText}>Lấy</Text>
          </TouchableOpacity>
        </View>
        <MonthlyLineChart data={unpaidChartData} color="#FF9800" loading={unpaidChartLoading} />
      </Card>

      <Card style={styles.block}>
        <Text style={styles.blockTitle}>Danh sách đơn hàng ({filteredOrders.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
          {REVENUE_ORDER_STATUS_FILTERS.map((item) => {
            const active = item.value === revenueOrderStatusFilter
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setRevenueOrderStatusFilter(item.value as RevenueOrderStatusFilter)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {ordersLoading ? (
          <ActivityIndicator color="#3366CC" />
        ) : paginatedOrders.length === 0 ? (
          <Text style={styles.emptyText}>Không có đơn hàng cho bộ lọc này.</Text>
        ) : (
          <View style={styles.orderList}>
            {paginatedOrders.map((order) => {
              const statusUi = getOrderStatusUi(order.status)
              return (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.orderCard, { borderTopColor: statusUi.cardBorderColor, borderTopWidth: 3 }]}
                  onPress={() => openOrderDetail(order)}
                >
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderCode}>{order.code || order.id.slice(0, 8)}</Text>
                    <View style={[styles.badge, { backgroundColor: statusUi.pillBg }]}>
                      <Text style={styles.badgeText}>{statusUi.labelVi}</Text>
                    </View>
                  </View>
                  <Text style={styles.orderName} numberOfLines={1}>
                    {order.name}
                  </Text>
                  <Text style={styles.orderMeta} numberOfLines={1}>
                    KH: {order.customerName || order.customerId}
                  </Text>
                  <Text style={styles.orderAmount}>{order.totalAmount.toLocaleString('vi-VN')} đ</Text>
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
          <Text style={styles.pageLabel}>
            Trang {ordersPage}/{totalOrderPages}
          </Text>
          <TouchableOpacity
            disabled={ordersPage === totalOrderPages}
            onPress={() => setOrdersPage((p) => Math.min(totalOrderPages, p + 1))}
            style={[styles.pagerBtn, ordersPage === totalOrderPages && styles.btnDisabled]}
          >
            <Text style={styles.pagerText}>Tiếp</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Modal visible={orderDetailModalOpen} animationType="slide" onRequestClose={closeOrderDetailModal}>
        <View style={styles.modalScreen}>
          <View style={styles.modalTopBar}>
            <TouchableOpacity style={styles.modalBackBtn} onPress={closeOrderDetailModal} hitSlop={12}>
              <ChevronLeft size={24} color="#003366" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
            {orderDetail && !orderDetailLoading ? (
              <View style={[styles.modalStatusBadge, { backgroundColor: getOrderStatusUi(orderDetail.status).pillBg }]}>
                <CheckCircle2 size={14} color="#fff" />
                <Text style={styles.modalStatusText}>{getOrderStatusUi(orderDetail.status).labelVi}</Text>
              </View>
            ) : (
              <View style={styles.modalHeaderSpacer} />
            )}
          </View>

          {orderDetailLoading || orderDetail ? (
            <AdminOrderDetailModal order={orderDetail} loading={orderDetailLoading} />
          ) : (
            <View style={detailStyles.loadingWrap}>
              <Text style={styles.emptyText}>Không có dữ liệu đơn hàng.</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  filterSection: { gap: 8 },
  filterText: { fontSize: 12, color: '#4B5563', fontWeight: '600', lineHeight: 18 },
  filterPeriod: { color: '#003366', fontWeight: '700' },
  filterControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#111827',
    backgroundColor: '#fff'
  },
  filterBtn: { backgroundColor: '#3366CC', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9 },
  filterBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  block: { paddingVertical: 14 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  blockTitle: { fontSize: 16, color: '#003366', fontWeight: '700' },
  inlineFilter: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' },
  filterChipsRow: { gap: 8, paddingBottom: 8 },
  chip: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  chipActive: { backgroundColor: '#3366CC', borderColor: '#3366CC' },
  chipText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  orderList: { gap: 8 },
  orderCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff'
  },
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
  emptyText: { color: '#6B7280', fontSize: 13, marginVertical: 8 },
  modalScreen: { flex: 1, backgroundColor: '#F5F7FA' },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8
  },
  modalBackBtn: { padding: 4 },
  modalTitle: {
    flex: 1,
    color: '#003366',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginRight: -28
  },
  modalHeaderSpacer: { width: 72 },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: 120
  },
  modalStatusText: { color: '#fff', fontSize: 11, fontWeight: '700' }
})
