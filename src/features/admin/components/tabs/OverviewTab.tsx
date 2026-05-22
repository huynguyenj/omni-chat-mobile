import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import {
  CheckCircle2,
  Clock3,
  FileX2,
  Milk,
  Package2,
  ShoppingCart,
  TrendingUp
} from 'lucide-react-native'
import Card from '@/components/ui/cards/Card'
import AdminDashboardMetricCard from '../AdminDashboardMetricCard'
import { OrderApi } from '../../api/order-api'
import { ProductApi } from '../../api/product-api'
import { SupportTaskApi } from '../../api/support-task-api'
import type { OrderDashboardMonthRow } from '../../types/order-type'
import type { ProductType } from '../../types/product-type'
import type { TaskIntentMonthRow } from '../../types/support-task-type'
import {
  buildOrderDashboardChartRows,
  buildTaskDashboardChartRows,
  collectIntentNames,
  collectOrderDashboardStatusNames,
  extractArrayFromResponse,
  extractProductItems,
  extractProductTotalItems,
  extractProductTotalPages,
  isApiSuccessLike,
  isAxiosNoDataError,
  normalizePeriodInput,
  summarizeInventoryFromProducts,
  sumTaskIntentByName
} from '../../utils/api-helpers'
import { notifyError, notifyInfo } from '../../utils/notify'

const DEFAULT_PERIOD = '2026'

const OVERVIEW_INTENT_CARD_CONFIG = [
  {
    key: 'PRE_SALE',
    title: 'PRE_SALE',
    accentColor: '#3366CC',
    iconBg: '#EBF1FF',
    iconColor: '#3366CC',
    valueColor: '#3366CC',
    Icon: ShoppingCart
  },
  {
    key: 'ORDER_CREATION',
    title: 'ORDER_CREATION',
    accentColor: '#2ECC71',
    iconBg: '#E8F8F0',
    iconColor: '#2ECC71',
    valueColor: '#2ECC71',
    Icon: CheckCircle2
  },
  {
    key: 'ORDER_STATUS',
    title: 'ORDER_STATUS',
    accentColor: '#FF9800',
    iconBg: '#FFF3E0',
    iconColor: '#FF9800',
    valueColor: '#FF9800',
    Icon: Clock3
  },
  {
    key: 'PAYMENT',
    title: 'PAYMENT',
    accentColor: '#F44336',
    iconBg: '#FFEBEE',
    iconColor: '#F44336',
    valueColor: '#F44336',
    Icon: FileX2
  },
  {
    key: 'POST_SALE_CHANGE',
    title: 'POST_SALE_CHANGE',
    accentColor: '#9C27B0',
    iconBg: '#F3E8FF',
    iconColor: '#9C27B0',
    valueColor: '#9C27B0',
    Icon: TrendingUp
  }
] as const

function DashboardTable({
  columns,
  rows,
  totalRow
}: {
  columns: string[]
  rows: Array<Record<string, string | number>>
  totalRow: Record<string, number>
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        <View style={tableStyles.headerRow}>
          <Text style={[tableStyles.th, tableStyles.thFirst]}>Tháng</Text>
          {columns.map((col) => (
            <Text key={col} style={tableStyles.th}>
              {col}
            </Text>
          ))}
          <Text style={tableStyles.th}>Tổng</Text>
        </View>
        {rows.map((row) => (
          <View key={String(row.monthLabel)} style={tableStyles.dataRow}>
            <Text style={[tableStyles.td, tableStyles.tdFirst]}>{String(row.monthLabel)}</Text>
            {columns.map((col) => (
              <Text key={col} style={tableStyles.td}>
                {Number(row[col] ?? 0).toLocaleString('vi-VN')}
              </Text>
            ))}
            <Text style={[tableStyles.td, tableStyles.tdBold]}>
              {Number(row.total ?? 0).toLocaleString('vi-VN')}
            </Text>
          </View>
        ))}
        <View style={tableStyles.totalRow}>
          <Text style={[tableStyles.td, tableStyles.tdFirst, tableStyles.tdBold]}>Tổng kỳ</Text>
          {columns.map((col) => (
            <Text key={col} style={[tableStyles.td, tableStyles.tdBold]}>
              {(totalRow[col] ?? 0).toLocaleString('vi-VN')}
            </Text>
          ))}
          <Text style={[tableStyles.td, tableStyles.tdBold]}>
            {Object.values(totalRow).reduce((a, b) => a + b, 0).toLocaleString('vi-VN')}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const tableStyles = StyleSheet.create({
  headerRow: { flexDirection: 'row', backgroundColor: '#F5F7FA', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  th: { paddingHorizontal: 10, paddingVertical: 8, minWidth: 88, fontSize: 11, fontWeight: '700', color: '#003366' },
  thFirst: { minWidth: 72 },
  dataRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  totalRow: { flexDirection: 'row', borderTopWidth: 2, borderTopColor: '#00336633', backgroundColor: '#EBF1FF66' },
  td: { paddingHorizontal: 10, paddingVertical: 8, minWidth: 88, fontSize: 12, color: '#374151' },
  tdFirst: { minWidth: 72, fontWeight: '600', color: '#003366' },
  tdBold: { fontWeight: '700', color: '#003366' }
})

export default function OverviewTab() {
  const [intentSummaryPeriodInput, setIntentSummaryPeriodInput] = useState(DEFAULT_PERIOD)
  const [intentSummaryAppliedPeriod, setIntentSummaryAppliedPeriod] = useState(DEFAULT_PERIOD)
  const [intentCardAppliedByName, setIntentCardAppliedByName] = useState<Record<string, string>>(
    Object.fromEntries(OVERVIEW_INTENT_CARD_CONFIG.map((item) => [item.key, DEFAULT_PERIOD]))
  )
  const [intentCardValueByName, setIntentCardValueByName] = useState<Record<string, number>>(
    Object.fromEntries(OVERVIEW_INTENT_CARD_CONFIG.map((item) => [item.key, 0]))
  )
  const [intentCardLoadingByName, setIntentCardLoadingByName] = useState<Record<string, boolean>>(
    Object.fromEntries(OVERVIEW_INTENT_CARD_CONFIG.map((item) => [item.key, false]))
  )

  const [inventoryDashboard, setInventoryDashboard] = useState<{ totalProducts: number; totalItems: number } | null>(
    null
  )
  const [inventoryDashboardLoading, setInventoryDashboardLoading] = useState(false)

  const [taskDashboardRows, setTaskDashboardRows] = useState<TaskIntentMonthRow[]>([])
  const [taskDashboardLoading, setTaskDashboardLoading] = useState(false)
  const [taskDashboardPeriodInput, setTaskDashboardPeriodInput] = useState(DEFAULT_PERIOD)
  const [taskDashboardAppliedPeriod, setTaskDashboardAppliedPeriod] = useState(DEFAULT_PERIOD)

  const [orderDashboardRows, setOrderDashboardRows] = useState<OrderDashboardMonthRow[]>([])
  const [orderDashboardLoading, setOrderDashboardLoading] = useState(false)
  const [orderDashboardInput, setOrderDashboardInput] = useState(DEFAULT_PERIOD)
  const [orderDashboardAppliedInput, setOrderDashboardAppliedInput] = useState(DEFAULT_PERIOD)

  const taskIntentNames = useMemo(() => collectIntentNames(taskDashboardRows), [taskDashboardRows])
  const taskChartData = useMemo(
    () => buildTaskDashboardChartRows(taskDashboardRows, taskIntentNames),
    [taskDashboardRows, taskIntentNames]
  )
  const taskIntentTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const name of taskIntentNames) totals[name] = 0
    for (const row of taskChartData) {
      for (const name of taskIntentNames) {
        totals[name] += Number(row[name] ?? 0)
      }
    }
    return totals
  }, [taskChartData, taskIntentNames])

  const orderDashboardStatusNames = useMemo(
    () => collectOrderDashboardStatusNames(orderDashboardRows),
    [orderDashboardRows]
  )
  const orderChartData = useMemo(
    () => buildOrderDashboardChartRows(orderDashboardRows, orderDashboardStatusNames),
    [orderDashboardRows, orderDashboardStatusNames]
  )
  const orderDashboardTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const name of orderDashboardStatusNames) totals[name] = 0
    for (const row of orderChartData) {
      for (const name of orderDashboardStatusNames) {
        totals[name] += Number(row[name] ?? 0)
      }
    }
    return totals
  }, [orderChartData, orderDashboardStatusNames])

  useEffect(() => {
    const fetchInventoryDashboard = async () => {
      setInventoryDashboardLoading(true)
      try {
        const pageSize = 100
        let page = 1
        let totalPages = 1
        let totalItems = 0
        const allProducts: ProductType[] = []

        while (page <= totalPages) {
          const response = await ProductApi.getAllProducts(page, pageSize)
          allProducts.push(...extractProductItems(response))
          totalPages = extractProductTotalPages(response)
          if (page === 1) totalItems = extractProductTotalItems(response)
          page += 1
        }

        setInventoryDashboard(summarizeInventoryFromProducts(allProducts, totalItems))
      } catch {
        setInventoryDashboard(null)
        notifyError('Không tải được dữ liệu tồn kho.')
      } finally {
        setInventoryDashboardLoading(false)
      }
    }
    void fetchInventoryDashboard()
  }, [])

  const fetchTaskDashboard = useCallback(async (rawInput: string) => {
    const normalized = normalizePeriodInput(rawInput)
    if (!normalized) {
      notifyError('Định dạng không hợp lệ. Nhập yyyy hoặc mm/yyyy.')
      return
    }
    setTaskDashboardPeriodInput(normalized)
    setTaskDashboardAppliedPeriod(normalized)
    setTaskDashboardLoading(true)
    try {
      const response = await SupportTaskApi.getTaskIntentDashboard(normalized)
      const rows = extractArrayFromResponse(response) as TaskIntentMonthRow[]
      if (rows.length > 0 || isApiSuccessLike(response)) {
        setTaskDashboardRows(rows)
        if (rows.length === 0) {
          notifyInfo('Không có dữ liệu task cho kỳ này.')
        }
      } else {
        setTaskDashboardRows([])
        notifyInfo('Không có dữ liệu task cho kỳ này.')
      }
    } catch (error) {
      if (isAxiosNoDataError(error)) {
        setTaskDashboardRows([])
        notifyInfo('Không có dữ liệu task cho kỳ này.')
        return
      }
      setTaskDashboardRows([])
      notifyError('Không tải được task dashboard. Vui lòng thử lại.')
    } finally {
      setTaskDashboardLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTaskDashboard(DEFAULT_PERIOD)
  }, [fetchTaskDashboard])

  const fetchIntentCardValue = useCallback(async (intentName: string, rawInput: string) => {
    const normalized = normalizePeriodInput(rawInput)
    if (!normalized) {
      notifyError('Định dạng không hợp lệ. Nhập yyyy hoặc mm/yyyy.')
      return
    }
    setIntentCardAppliedByName((prev) => ({ ...prev, [intentName]: normalized }))
    setIntentCardLoadingByName((prev) => ({ ...prev, [intentName]: true }))
    try {
      const response = await SupportTaskApi.getTaskIntentDashboard(normalized)
      const rows = extractArrayFromResponse(response) as TaskIntentMonthRow[]
      if (rows.length > 0 || isApiSuccessLike(response)) {
        setIntentCardValueByName((prev) => ({
          ...prev,
          [intentName]: sumTaskIntentByName(rows, intentName)
        }))
        if (rows.length === 0) {
          notifyInfo(`Không có dữ liệu ${intentName} cho kỳ này.`)
        }
      } else {
        setIntentCardValueByName((prev) => ({ ...prev, [intentName]: 0 }))
        notifyInfo(`Không có dữ liệu ${intentName} cho kỳ này.`)
      }
    } catch (error) {
      if (isAxiosNoDataError(error)) {
        setIntentCardValueByName((prev) => ({ ...prev, [intentName]: 0 }))
        notifyInfo(`Không có dữ liệu ${intentName} cho kỳ này.`)
        return
      }
      setIntentCardValueByName((prev) => ({ ...prev, [intentName]: 0 }))
      notifyError(`Không tải được dữ liệu ${intentName}. Vui lòng thử lại.`)
    } finally {
      setIntentCardLoadingByName((prev) => ({ ...prev, [intentName]: false }))
    }
  }, [])

  useEffect(() => {
    OVERVIEW_INTENT_CARD_CONFIG.forEach((item) => {
      void fetchIntentCardValue(item.key, DEFAULT_PERIOD)
    })
  }, [fetchIntentCardValue])

  const applyIntentSummaryPeriod = useCallback(
    (rawInput: string) => {
      const normalized = normalizePeriodInput(rawInput)
      if (!normalized) {
        notifyError('Định dạng không hợp lệ. Nhập yyyy hoặc mm/yyyy.')
        return
      }
      setIntentSummaryPeriodInput(normalized)
      setIntentSummaryAppliedPeriod(normalized)
      OVERVIEW_INTENT_CARD_CONFIG.forEach((item) => {
        void fetchIntentCardValue(item.key, normalized)
      })
    },
    [fetchIntentCardValue]
  )

  const fetchOrderDashboard = useCallback(async (rawInput: string) => {
    const normalized = normalizePeriodInput(rawInput)
    if (!normalized) {
      notifyError('Định dạng không hợp lệ. Nhập yyyy hoặc mm/yyyy.')
      return
    }
    setOrderDashboardInput(normalized)
    setOrderDashboardAppliedInput(normalized)
    setOrderDashboardLoading(true)
    try {
      const response = await OrderApi.getOrderDashboard(normalized)
      const rows = extractArrayFromResponse(response) as OrderDashboardMonthRow[]
      if (rows.length > 0 || isApiSuccessLike(response)) {
        setOrderDashboardRows(rows)
        if (rows.length === 0) {
          notifyInfo('Không có dữ liệu bảng tổng quan đơn hàng cho kỳ này.')
        }
      } else {
        setOrderDashboardRows([])
        notifyInfo('Không có dữ liệu bảng tổng quan đơn hàng cho kỳ này.')
      }
    } catch (error) {
      if (isAxiosNoDataError(error)) {
        setOrderDashboardRows([])
        notifyInfo('Không có dữ liệu bảng tổng quan đơn hàng cho kỳ này.')
        return
      }
      setOrderDashboardRows([])
      notifyError('Không tải được bảng tổng quan đơn hàng. Vui lòng thử lại.')
    } finally {
      setOrderDashboardLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchOrderDashboard(DEFAULT_PERIOD)
  }, [fetchOrderDashboard])

  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <Text style={styles.filterHint}>
          Nhập yyyy hoặc mm/yyyy (UTC). Đang xem:{' '}
          <Text style={styles.filterPeriod}>{intentSummaryAppliedPeriod}</Text>
        </Text>
        <View style={styles.filterControls}>
          <TextInput
            value={intentSummaryPeriodInput}
            onChangeText={setIntentSummaryPeriodInput}
            placeholder="yyyy hoặc mm/yyyy"
            placeholderTextColor="#9CA3AF"
            style={styles.filterInput}
          />
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => applyIntentSummaryPeriod(intentSummaryPeriodInput)}
          >
            <Text style={styles.filterBtnText}>Lấy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <AdminDashboardMetricCard
          accentColor="#3366CC"
          iconBg="#EBF1FF"
          iconColor="#3366CC"
          valueColor="#3366CC"
          Icon={Milk}
          topRightIcon={TrendingUp}
          title="Tổng tồn kho sản phẩm"
          loading={inventoryDashboardLoading}
          value={
            inventoryDashboard != null
              ? inventoryDashboard.totalProducts.toLocaleString('vi-VN')
              : '—'
          }
          unit="sản phẩm"
          footer={
            inventoryDashboard
              ? `Loại sản phẩm: ${inventoryDashboard.totalItems.toLocaleString('vi-VN')}`
              : 'Chưa có dữ liệu kho'
          }
        />

        {OVERVIEW_INTENT_CARD_CONFIG.map((item) => {
          const CardIcon = item.Icon
          const currentApplied = intentCardAppliedByName[item.key] ?? DEFAULT_PERIOD
          const currentValue = intentCardValueByName[item.key] ?? 0
          const currentLoading = intentCardLoadingByName[item.key] ?? false
          return (
            <AdminDashboardMetricCard
              key={item.key}
              accentColor={item.accentColor}
              iconBg={item.iconBg}
              iconColor={item.iconColor}
              valueColor={item.valueColor}
              Icon={CardIcon}
              title={item.title}
              loading={currentLoading}
              value={currentValue.toLocaleString('vi-VN')}
              unit="nhiệm vụ"
              footer={`Kỳ lọc: ${currentApplied || intentSummaryAppliedPeriod}`}
            />
          )
        })}
      </View>

      <Card style={styles.block}>
        <Text style={styles.blockTitle}>Bảng tổng quan nhiệm vụ</Text>
        <Text style={styles.blockSub}>
          Đang xem: <Text style={styles.filterPeriod}>{taskDashboardAppliedPeriod}</Text>
        </Text>
        <View style={styles.inlineFilter}>
          <TextInput
            value={taskDashboardPeriodInput}
            onChangeText={setTaskDashboardPeriodInput}
            placeholder="yyyy hoặc mm/yyyy"
            placeholderTextColor="#9CA3AF"
            style={styles.filterInput}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => void fetchTaskDashboard(taskDashboardPeriodInput)}>
            <Text style={styles.filterBtnText}>Lấy dữ liệu</Text>
          </TouchableOpacity>
        </View>
        {taskDashboardLoading ? (
          <ActivityIndicator color="#3366CC" style={styles.loader} />
        ) : taskChartData.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có dữ liệu task dashboard.</Text>
        ) : (
          <DashboardTable columns={taskIntentNames} rows={taskChartData} totalRow={taskIntentTotals} />
        )}
      </Card>

      <Card style={styles.block}>
        <View style={styles.blockTitleRow}>
          <Package2 size={18} color="#3366CC" />
          <Text style={styles.blockTitle}>Bảng tổng quan đơn hàng</Text>
        </View>
        <Text style={styles.blockSub}>
          Đang xem: <Text style={styles.filterPeriod}>{orderDashboardAppliedInput}</Text>
        </Text>
        <View style={styles.inlineFilter}>
          <TextInput
            value={orderDashboardInput}
            onChangeText={setOrderDashboardInput}
            placeholder="yyyy hoặc mm/yyyy"
            placeholderTextColor="#9CA3AF"
            style={styles.filterInput}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => void fetchOrderDashboard(orderDashboardInput)}>
            <Text style={styles.filterBtnText}>Lấy dữ liệu</Text>
          </TouchableOpacity>
        </View>
        {orderDashboardLoading ? (
          <ActivityIndicator color="#3366CC" style={styles.loader} />
        ) : orderChartData.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có dữ liệu bảng tổng quan đơn hàng.</Text>
        ) : orderDashboardStatusNames.length === 0 ? (
          <Text style={styles.emptyText}>Có tháng nhưng chưa có trạng thái đơn (status rỗng).</Text>
        ) : (
          <DashboardTable
            columns={orderDashboardStatusNames}
            rows={orderChartData}
            totalRow={orderDashboardTotals}
          />
        )}
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  filterSection: { gap: 8 },
  filterHint: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  filterPeriod: { fontWeight: '700', color: '#003366' },
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
  blockTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  blockTitle: { fontSize: 16, color: '#003366', fontWeight: '700' },
  blockSub: { fontSize: 12, color: '#6B7280', marginBottom: 10 },
  inlineFilter: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' },
  loader: { marginVertical: 12 },
  emptyText: { fontSize: 13, color: '#6B7280', marginVertical: 8 }
})
