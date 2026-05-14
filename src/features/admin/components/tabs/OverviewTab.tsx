import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { CheckCircle2, Clock3, Package2, ShoppingCart, TrendingUp, XCircle } from 'lucide-react-native'
import Card from '@/components/ui/cards/Card'
import { OrderApi } from '../../api/order-api'
import { ProductApi } from '../../api/product-api'
import { SupportTaskApi } from '../../api/support-task-api'
import { TaskCancelReasonApi } from '../../api/task-cancel-reason-api'
import type { OrderDashboardMonthRow } from '../../types/order-type'
import type { ProductType } from '../../types/product-type'
import type { TaskIntentMonthRow } from '../../types/support-task-type'
import {
  extractArrayFromResponse,
  extractProductTotalItems,
  extractProductTotalPages,
  isApiSuccessLike,
  normalizeCancelReasonMeta
} from '../../utils/api-helpers'
import { notifyError, notifyInfo } from '../../utils/notify'

type CancelReasonRow = {
  id: string
  title: string
  description: string
  createdAt: string
}

type InventorySummary = {
  totalProducts: number
  totalItems: number
}

const DEFAULT_PERIOD = '2026'

const INTENT_KEYS = ['PRE_SALE', 'ORDER_CREATION', 'ORDER_STATUS', 'PAYMENT', 'POST_SALE_CHANGE']

function normalizePeriodInput(value: string): string | null {
  const trimmed = value.trim()
  if (/^\d{4}$/.test(trimmed)) return trimmed
  const monthYearMatch = /^(\d{1,2})\/(\d{4})$/.exec(trimmed)
  if (!monthYearMatch) return null

  const month = Number(monthYearMatch[1])
  if (month < 1 || month > 12) return null
  return `${String(month).padStart(2, '0')}/${monthYearMatch[2]}`
}

function sumTaskIntentByName(rows: TaskIntentMonthRow[], intentName: string): number {
  return rows.reduce((sum, row) => {
    const byIntent = new Map((row.intents ?? []).map((item) => [item.intentName, Number(item.taskCount ?? 0)]))
    return sum + Number(byIntent.get(intentName) ?? 0)
  }, 0)
}

function mapCancelReasonRow(raw: unknown): CancelReasonRow {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const title =
    typeof o.reasonName === 'string'
      ? o.reasonName
      : typeof o.name === 'string'
        ? o.name
        : typeof o.reason === 'string'
          ? o.reason
          : typeof o.title === 'string'
            ? o.title
            : '�'

  return {
    id: String(o.id ?? o.cancelReasonId ?? ''),
    title,
    description: typeof o.description === 'string' ? o.description : typeof o.note === 'string' ? o.note : '',
    createdAt: typeof o.createdAt === 'string' ? o.createdAt : typeof o.created_at === 'string' ? o.created_at : ''
  }
}

function collectIntentNames(rows: TaskIntentMonthRow[]): string[] {
  const set = new Set<string>()
  for (const row of rows) {
    for (const item of row.intents ?? []) {
      if (item.intentName) set.add(item.intentName)
    }
  }
  const ordered = INTENT_KEYS.filter((name) => set.has(name))
  const rest = [...set].filter((name) => !INTENT_KEYS.includes(name)).sort()
  return [...ordered, ...rest]
}

function summarizeInventoryFromProducts(products: ProductType[], totalItems: number): InventorySummary {
  const totalProducts = products.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)
  return { totalProducts, totalItems }
}

function extractOrderStatusTotal(rows: OrderDashboardMonthRow[], status: string): number {
  const key = status.toLowerCase()
  return rows.reduce((sum, row) => {
    const hit = (row.status ?? []).find((entry) => String(entry.status).toLowerCase() === key)
    return sum + Number(hit?.count ?? 0)
  }, 0)
}

export default function OverviewTab() {
  const [summaryInput, setSummaryInput] = useState(DEFAULT_PERIOD)
  const [summaryApplied, setSummaryApplied] = useState(DEFAULT_PERIOD)
  const [inventoryDashboard, setInventoryDashboard] = useState<InventorySummary | null>(null)
  const [inventoryLoading, setInventoryLoading] = useState(false)

  const [taskRows, setTaskRows] = useState<TaskIntentMonthRow[]>([])
  const [taskLoading, setTaskLoading] = useState(false)
  const [taskPeriodInput, setTaskPeriodInput] = useState(DEFAULT_PERIOD)
  const [taskPeriodApplied, setTaskPeriodApplied] = useState(DEFAULT_PERIOD)

  const [orderRows, setOrderRows] = useState<OrderDashboardMonthRow[]>([])
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderPeriodInput, setOrderPeriodInput] = useState(DEFAULT_PERIOD)
  const [orderPeriodApplied, setOrderPeriodApplied] = useState(DEFAULT_PERIOD)

  const [cancelReasonPage, setCancelReasonPage] = useState(1)
  const pageSize = 8
  const [cancelReasonRows, setCancelReasonRows] = useState<CancelReasonRow[]>([])
  const [cancelReasonMeta, setCancelReasonMeta] = useState({
    total_pages: 0,
    total_items: 0,
    current_page: 1,
    page_size: pageSize
  })
  const [cancelReasonLoading, setCancelReasonLoading] = useState(false)

  const intentNames = useMemo(() => collectIntentNames(taskRows), [taskRows])
  const intentCardTotals = useMemo(() => {
    const output: Record<string, number> = {}
    for (const key of INTENT_KEYS) output[key] = sumTaskIntentByName(taskRows, key)
    return output
  }, [taskRows])

  const orderSummary = useMemo(
    () => ({
      completed: extractOrderStatusTotal(orderRows, 'Completed'),
      confirmed: extractOrderStatusTotal(orderRows, 'Confirmed'),
      cancelled: extractOrderStatusTotal(orderRows, 'Cancelled'),
      returned: extractOrderStatusTotal(orderRows, 'Returned')
    }),
    [orderRows]
  )

  const loadInventory = useCallback(async () => {
    setInventoryLoading(true)
    try {
      const pageSizeFetch = 100
      let page = 1
      let totalPages = 1
      let totalItems = 0
      const allProducts: ProductType[] = []

      while (page <= totalPages) {
        const response = await ProductApi.getAllProducts(page, pageSizeFetch)
        allProducts.push(...(extractArrayFromResponse(response) as ProductType[]))
        totalPages = extractProductTotalPages(response)
        if (page === 1) totalItems = extractProductTotalItems(response)
        page += 1
      }

      setInventoryDashboard(summarizeInventoryFromProducts(allProducts, totalItems))
    } catch {
      setInventoryDashboard(null)
      notifyError('Không tải được dữ liệu tồn kho.')
    } finally {
      setInventoryLoading(false)
    }
  }, [])

  const loadTaskDashboard = useCallback(async (rawInput: string) => {
    const normalized = normalizePeriodInput(rawInput)
    if (!normalized) {
      notifyInfo('Nhập đúng định dạng yyyy hoặc mm/yyyy')
      return
    }

    setTaskPeriodInput(normalized)
    setTaskPeriodApplied(normalized)
    setTaskLoading(true)
    try {
      const response = await SupportTaskApi.getTaskIntentDashboard(normalized)
      const rows = extractArrayFromResponse(response) as TaskIntentMonthRow[]
      if (rows.length > 0 || isApiSuccessLike(response)) {
        setTaskRows(rows)
      } else {
        setTaskRows([])
      }
    } catch {
      setTaskRows([])
      notifyError('Không tải được task dashboard.')
    } finally {
      setTaskLoading(false)
    }
  }, [])

  const loadOrderDashboard = useCallback(async (rawInput: string) => {
    const normalized = normalizePeriodInput(rawInput)
    if (!normalized) {
      notifyInfo('Nhập đúng định dạng yyyy hoặc mm/yyyy')
      return
    }

    setOrderPeriodInput(normalized)
    setOrderPeriodApplied(normalized)
    setOrderLoading(true)
    try {
      const response = await OrderApi.getOrderDashboard(normalized)
      const rows = extractArrayFromResponse(response) as OrderDashboardMonthRow[]
      if (rows.length > 0 || isApiSuccessLike(response)) {
        setOrderRows(rows)
      } else {
        setOrderRows([])
      }
    } catch {
      setOrderRows([])
      notifyError('Không tải được order dashboard.')
    } finally {
      setOrderLoading(false)
    }
  }, [])

  const loadCancelReasons = useCallback(async () => {
    setCancelReasonLoading(true)
    try {
      const response = await TaskCancelReasonApi.getPaging(cancelReasonPage, pageSize)
      const items = extractArrayFromResponse(response)
      if (items.length > 0 || isApiSuccessLike(response)) {
        setCancelReasonRows(items.map(mapCancelReasonRow))
        const responseObj = response && typeof response === 'object' ? (response as Record<string, unknown>) : {}
        const dataObj = responseObj.data && typeof responseObj.data === 'object' ? (responseObj.data as Record<string, unknown>) : {}
        const metaSource =
          dataObj.meta ??
          dataObj.pagination ??
          dataObj.pageInfo ??
          responseObj.meta ??
          responseObj.pagination ??
          responseObj.pageInfo ??
          null
        setCancelReasonMeta(normalizeCancelReasonMeta(metaSource))
      } else {
        setCancelReasonRows([])
      }
    } catch {
      setCancelReasonRows([])
      notifyError('Không tải được danh sách lý do hủy task.')
    } finally {
      setCancelReasonLoading(false)
    }
  }, [cancelReasonPage])

  useEffect(() => {
    void loadInventory()
    void loadTaskDashboard(DEFAULT_PERIOD)
    void loadOrderDashboard(DEFAULT_PERIOD)
  }, [loadInventory, loadOrderDashboard, loadTaskDashboard])

  useEffect(() => {
    void loadCancelReasons()
  }, [loadCancelReasons])

  const applySummaryPeriod = () => {
    const normalized = normalizePeriodInput(summaryInput)
    if (!normalized) {
      notifyInfo('Nhập đúng định dạng yyyy hoặc mm/yyyy')
      return
    }
    setSummaryInput(normalized)
    setSummaryApplied(normalized)
    void loadTaskDashboard(normalized)
    void loadOrderDashboard(normalized)
  }

  const cancelReasonTotalPages = Math.max(1, cancelReasonMeta.total_pages || 1)

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <Text style={styles.filterText}>Kỳ lọc: {summaryApplied}</Text>
        <TextInput
          value={summaryInput}
          onChangeText={setSummaryInput}
          placeholder="yyyy hoac mm/yyyy"
          placeholderTextColor="#9CA3AF"
          style={styles.filterInput}
        />
        <TouchableOpacity style={styles.filterBtn} onPress={applySummaryPeriod}>
          <Text style={styles.filterBtnText}>Lấy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid2}>
        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Package2 size={18} color="#3366CC" />
            <Text style={styles.cardTitle}>Tổng tồn kho</Text>
          </View>
          {inventoryLoading ? (
            <ActivityIndicator color="#3366CC" />
          ) : (
            <>
              <Text style={styles.cardValue}>{inventoryDashboard?.totalProducts?.toLocaleString('vi-VN') ?? '0'}</Text>
              <Text style={styles.cardSub}>Loại sản phẩm: {inventoryDashboard?.totalItems?.toLocaleString('vi-VN') ?? '0'}</Text>
            </>
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <CheckCircle2 size={18} color="#2ECC71" />
            <Text style={styles.cardTitle}>Đơn hoàn thành</Text>
          </View>
          <Text style={styles.cardValue}>{orderSummary.completed.toLocaleString('vi-VN')}</Text>
          <Text style={styles.cardSub}>Ky {orderPeriodApplied}</Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <XCircle size={18} color="#F44336" />
            <Text style={styles.cardTitle}>Đơn hủy</Text>
          </View>
          <Text style={styles.cardValue}>{orderSummary.cancelled.toLocaleString('vi-VN')}</Text>
          <Text style={styles.cardSub}>Ky {orderPeriodApplied}</Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Clock3 size={18} color="#FF9800" />
            <Text style={styles.cardTitle}>Đơn xác nhận</Text>
          </View>
          <Text style={styles.cardValue}>{orderSummary.confirmed.toLocaleString('vi-VN')}</Text>
          <Text style={styles.cardSub}>Ky {orderPeriodApplied}</Text>
        </Card>
      </View>

      <Card style={styles.block}>
        <Text style={styles.blockTitle}>Dashboard task intent</Text>
        <View style={styles.inlineFilter}>
          <TextInput
            value={taskPeriodInput}
            onChangeText={setTaskPeriodInput}
            placeholder="yyyy hoac mm/yyyy"
            placeholderTextColor="#9CA3AF"
            style={styles.filterInput}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => void loadTaskDashboard(taskPeriodInput)}>
            <Text style={styles.filterBtnText}>Lọc</Text>   
          </TouchableOpacity>
        </View>
        {taskLoading ? (
          <ActivityIndicator color="#3366CC" />
        ) : (
          <>
            <View style={styles.intentRowWrap}>
              {INTENT_KEYS.map((key) => (
                <View key={key} style={styles.intentPill}>
                  <Text style={styles.intentPillTitle}>{key}</Text>
                  <Text style={styles.intentPillValue}>{(intentCardTotals[key] ?? 0).toLocaleString('vi-VN')}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.cardSub}>Có {intentNames.length} nhóm intent trong kỳ {taskPeriodApplied}</Text>
          </>
        )}
      </Card>

      <Card style={styles.block}>
        <Text style={styles.blockTitle}>Dashboard order</Text>
        <View style={styles.inlineFilter}>
          <TextInput
            value={orderPeriodInput}
            onChangeText={setOrderPeriodInput}
            placeholder="yyyy hoac mm/yyyy"
            placeholderTextColor="#9CA3AF"
            style={styles.filterInput}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => void loadOrderDashboard(orderPeriodInput)}>
            <Text style={styles.filterBtnText}>Lọc</Text> 
          </TouchableOpacity>
        </View>
        {orderLoading ? (
          <ActivityIndicator color="#3366CC" />
        ) : (
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <ShoppingCart size={16} color="#3366CC" />
              <Text style={styles.statusText}>Trả về: {orderSummary.returned.toLocaleString('vi-VN')}</Text>
            </View>
            <View style={styles.statusItem}>
              <TrendingUp size={16} color="#2ECC71" />
              <Text style={styles.statusText}>Hoàn thành: {orderSummary.completed.toLocaleString('vi-VN')}</Text>
            </View>
            <View style={styles.statusItem}>
              <XCircle size={16} color="#F44336" />
              <Text style={styles.statusText}>Hủy: {orderSummary.cancelled.toLocaleString('vi-VN')}</Text>
            </View>
          </View>
        )}
      </Card>

      <Card style={styles.block}>
        <Text style={styles.blockTitle}>Danh sách lý do hủy task</Text>
        {cancelReasonLoading ? (
          <ActivityIndicator color="#3366CC" />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {cancelReasonRows.map((row, idx) => (
                  <View key={`${row.id}-${idx}`} style={styles.reasonRow}>
                    <Text style={styles.reasonTitle}>{row.title}</Text>
                    <Text style={styles.reasonDesc}>{row.description || 'Không có mô tả'}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={styles.pager}>
              <TouchableOpacity
                disabled={cancelReasonPage <= 1}
                onPress={() => setCancelReasonPage((p) => Math.max(1, p - 1))}
                style={[styles.pagerBtn, cancelReasonPage <= 1 && styles.btnDisabled]}
              >
                <Text style={styles.pagerText}>Trước</Text>
              </TouchableOpacity>
              <Text style={styles.cardSub}>Trang {cancelReasonPage}/{cancelReasonTotalPages}</Text>
              <TouchableOpacity
                disabled={cancelReasonPage >= cancelReasonTotalPages}
                onPress={() => setCancelReasonPage((p) => p + 1)}
                style={[styles.pagerBtn, cancelReasonPage >= cancelReasonTotalPages && styles.btnDisabled]}
              >
                <Text style={styles.pagerText}>Tiếp</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Card>
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
  cardTitleRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#374151', fontWeight: '600', fontSize: 13 },
  cardValue: { color: '#003366', fontSize: 24, fontWeight: '700' },
  cardSub: { color: '#6B7280', fontSize: 12, marginTop: 4 },
  block: { paddingVertical: 14 },
  blockTitle: { fontSize: 16, color: '#003366', fontWeight: '700', marginBottom: 10 },
  inlineFilter: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' },
  intentRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  intentPill: { borderWidth: 1, borderColor: '#DBEAFE', borderRadius: 10, padding: 8, minWidth: 130, backgroundColor: '#F8FAFC' },
  intentPillTitle: { color: '#6B7280', fontSize: 11, fontWeight: '600' },
  intentPillValue: { color: '#1E3A8A', fontSize: 18, fontWeight: '700' },
  statusList: { gap: 8 },
  statusItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { color: '#374151', fontSize: 13, fontWeight: '600' },
  reasonRow: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 8, minWidth: 300 },
  reasonTitle: { color: '#111827', fontWeight: '700' },
  reasonDesc: { color: '#6B7280', marginTop: 4, fontSize: 12 },
  pager: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pagerBtn: { backgroundColor: '#003366', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnDisabled: { opacity: 0.5 },
  pagerText: { color: '#fff', fontWeight: '600' }
})
