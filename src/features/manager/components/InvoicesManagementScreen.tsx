import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
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
import { ManagerInvoiceApi } from '../api/manager-invoice-api'
import type { ManagerInvoiceItem, ManagerInvoiceSortColumn, ManagerInvoiceStatusFilter } from '../types/manager-invoice-type'
import { formatDateTime } from '../utils/claimsNormalize'
import { formatKpiMoney, invoiceStatusSortRank, normInvoiceStatus } from '../utils/managerInvoicesNormalize'

const INVOICE_PAGE_SIZE = 10

const STATUS_CHIPS: { value: ManagerInvoiceStatusFilter; label: string }[] = [
  { value: null, label: 'Tất cả' },
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'completed', label: 'Đã thanh toán' },
  { value: 'pendingrefund', label: 'Quá hạn' },
  { value: 'refunded', label: 'Đã hoàn tiền' }
]

const SORT_COLUMNS: { key: ManagerInvoiceSortColumn; label: string }[] = [
  { key: 'customerName', label: 'Tên khách hàng' },
  { key: 'customerEmail', label: 'Email' },
  { key: 'customerPhoneNumber', label: 'SĐT' },
  { key: 'invoiceMethod', label: 'Phương thức' },
  { key: 'startedDate', label: 'Bắt đầu' },
  { key: 'endedDate', label: 'Kết thúc' },
  { key: 'total', label: 'Tổng hóa đơn' },
  { key: 'invoiceStatus', label: 'Trạng thái' }
]

function parseSortTime(s: string): number {
  if (!s) return 0
  const t = new Date(s).getTime()
  return Number.isNaN(t) ? 0 : t
}

function defaultDescendingForColumn(col: ManagerInvoiceSortColumn): boolean {
  if (col === 'startedDate' || col === 'endedDate' || col === 'total') return true
  return false
}

function compareInvoices(a: ManagerInvoiceItem, b: ManagerInvoiceItem, col: ManagerInvoiceSortColumn): number {
  switch (col) {
    case 'customerName':
      return a.customerName.localeCompare(b.customerName, 'vi')
    case 'customerEmail':
      return a.customerEmail.localeCompare(b.customerEmail, 'vi')
    case 'customerPhoneNumber':
      return a.customerPhoneNumber.localeCompare(b.customerPhoneNumber, 'vi')
    case 'invoiceMethod':
      return a.invoiceMethod.localeCompare(b.invoiceMethod, 'vi')
    case 'startedDate':
      return parseSortTime(a.startedDate) - parseSortTime(b.startedDate)
    case 'endedDate':
      return parseSortTime(a.endedDate) - parseSortTime(b.endedDate)
    case 'total':
      return a.total - b.total
    case 'invoiceStatus':
      return invoiceStatusSortRank(a.invoiceStatus) - invoiceStatusSortRank(b.invoiceStatus)
    default:
      return 0
  }
}

export default function InvoicesManagementScreen() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ManagerInvoiceStatusFilter>(null)

  const [allInvoices, setAllInvoices] = useState<ManagerInvoiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const [sortColumn, setSortColumn] = useState<ManagerInvoiceSortColumn>('startedDate')
  const [sortDescending, setSortDescending] = useState(true)
  const [uiPage, setUiPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  const loadAll = useCallback(async () => {
    const merged = await ManagerInvoiceApi.fetchAllInvoices()
    setAllInvoices(merged)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setListError(null)
    ;(async () => {
      try {
        await loadAll()
      } catch (e) {
        if (!cancelled) {
          const msg = typeof e === 'string' ? e : 'Không tải được hóa đơn.'
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
  }, [loadAll])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setListError(null)
    try {
      await loadAll()
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Làm mới thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setRefreshing(false)
    }
  }, [loadAll])

  const kpi = useMemo(() => {
    let totalAll = 0
    let paidCompleted = 0
    let pendingSum = 0
    let pendingRefundSum = 0
    let refundedSum = 0
    for (const inv of allInvoices) {
      totalAll += inv.total
      const st = normInvoiceStatus(inv.invoiceStatus)
      if (st === 'completed') {
        const line = inv.paidAmount > 0 ? inv.paidAmount : inv.total
        paidCompleted += line
      }
      if (st === 'pending') pendingSum += inv.total
      if (st === 'pendingrefund') pendingRefundSum += inv.total
      if (st === 'refunded') refundedSum += inv.total
    }
    return { totalAll, paidCompleted, pendingSum, pendingRefundSum, refundedSum }
  }, [allInvoices])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    return allInvoices.filter((inv) => {
      if (statusFilter) {
        if (normInvoiceStatus(inv.invoiceStatus) !== statusFilter) return false
      }
      if (q) {
        const fields = [inv.id, inv.customerId, inv.customerName, inv.customerEmail, inv.customerPhoneNumber].map((x) =>
          (x || '').toLowerCase()
        )
        if (!fields.some((f) => f.includes(q))) return false
      }
      return true
    })
  }, [allInvoices, debouncedSearch, statusFilter])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      const c = compareInvoices(a, b, sortColumn)
      return sortDescending ? -c : c
    })
    return arr
  }, [filtered, sortColumn, sortDescending])

  useEffect(() => {
    setUiPage(1)
  }, [statusFilter, debouncedSearch])

  const totalUiPages = Math.max(1, Math.ceil(sorted.length / INVOICE_PAGE_SIZE))
  const safeUiPage = Math.min(uiPage, totalUiPages)

  useEffect(() => {
    setUiPage((p) => Math.min(p, totalUiPages))
  }, [totalUiPages])

  const pageSlice = useMemo(() => {
    const page = Math.min(uiPage, totalUiPages)
    const start = (page - 1) * INVOICE_PAGE_SIZE
    return sorted.slice(start, start + INVOICE_PAGE_SIZE)
  }, [sorted, uiPage, totalUiPages])

  const pickSortColumn = (col: ManagerInvoiceSortColumn) => {
    if (col === sortColumn) setSortDescending((d) => !d)
    else {
      setSortColumn(col)
      setSortDescending(defaultDescendingForColumn(col))
    }
  }

  const selectStatus = (v: ManagerInvoiceStatusFilter) => {
    setStatusFilter(v)
  }

  const renderInvoice = ({ item, index }: { item: ManagerInvoiceItem; index: number }) => {
    const stt = (safeUiPage - 1) * INVOICE_PAGE_SIZE + index + 1
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>STT</Text>
          <Text style={styles.cellVal}>{stt}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>Tên khách hàng</Text>
          <Text style={styles.cellVal}>{item.customerName || '—'}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>Email</Text>
          <Text style={styles.cellVal} numberOfLines={2}>
            {item.customerEmail || '—'}
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>SĐT</Text>
          <Text style={styles.cellVal}>{item.customerPhoneNumber || '—'}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>Phương thức</Text>
          <Text style={styles.cellVal}>{item.invoiceMethod || '—'}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>Bắt đầu</Text>
          <Text style={styles.cellVal}>{formatDateTime(item.startedDate)}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>Kết thúc</Text>
          <Text style={styles.cellVal}>{formatDateTime(item.endedDate)}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>Tổng hóa đơn</Text>
          <Text style={styles.cellVal}>{formatKpiMoney(item.total)} ₫</Text>
        </View>
        <View style={[styles.cardRow, styles.cardRowLast]}>
          <Text style={styles.cellLabel}>Trạng thái</Text>
          <Text style={styles.cellVal}>{item.invoiceStatus || '—'}</Text>
        </View>
      </View>
    )
  }

  const listHeader = (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiScroll}>
        <View style={[styles.kpiCard, styles.kpiAccent]}>
          <Text style={styles.kpiLabel}>Tổng tiền</Text>
          <Text style={styles.kpiVal}>{formatKpiMoney(kpi.totalAll)} ₫</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Đã thanh toán</Text>
          <Text style={styles.kpiVal}>{formatKpiMoney(kpi.paidCompleted)} ₫</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Chờ thanh toán</Text>
          <Text style={styles.kpiVal}>{formatKpiMoney(kpi.pendingSum)} ₫</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Quá hạn</Text>
          <Text style={styles.kpiVal}>{formatKpiMoney(kpi.pendingRefundSum)} ₫</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Đã hoàn tiền</Text>
          <Text style={styles.kpiVal}>{formatKpiMoney(kpi.refundedSum)} ₫</Text>
        </View>
      </ScrollView>

      <TextInput
        style={styles.search}
        placeholder="Tìm theo mã, khách, email, SĐT…"
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {STATUS_CHIPS.map((c) => {
          const active = statusFilter === c.value
          return (
            <Pressable
              key={String(c.value)}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => selectStatus(c.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <Text style={styles.sortTitle}>Sắp xếp (chạm lặp đổi chiều)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {SORT_COLUMNS.map((s) => {
          const active = sortColumn === s.key
          return (
            <Pressable key={s.key} style={[styles.chip, active && styles.chipActive]} onPress={() => pickSortColumn(s.key)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {s.label}
                {active ? (sortDescending ? ' ↓' : ' ↑') : ''}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {listError ? <Text style={styles.bannerErr}>{listError}</Text> : null}
      {loading && !refreshing ? (
        <View style={styles.centerPad}>
          <ActivityIndicator size="large" />
          <Text style={styles.hint}>Đang tải toàn bộ hóa đơn…</Text>
        </View>
      ) : null}
    </View>
  )

  const listFooter = (
    <View style={styles.footer}>
      <Text style={styles.footerMeta}>
        {sorted.length} hóa đơn · Trang {safeUiPage}/{totalUiPages}
      </Text>
      <View style={styles.pager}>
        <Pressable
          style={[styles.pageBtn, safeUiPage <= 1 && styles.pageBtnDisabled]}
          disabled={safeUiPage <= 1}
          onPress={() => setUiPage((p) => Math.max(1, p - 1))}
        >
          <Text style={styles.pageBtnText}>Trước</Text>
        </Pressable>
        <Pressable
          style={[styles.pageBtn, safeUiPage >= totalUiPages && styles.pageBtnDisabled]}
          disabled={safeUiPage >= totalUiPages}
          onPress={() => setUiPage((p) => Math.min(totalUiPages, p + 1))}
        >
          <Text style={styles.pageBtnText}>Sau</Text>
        </Pressable>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <FlatList
        data={loading && !refreshing ? [] : pageSlice}
        keyExtractor={(item, index) => item.id || `inv-${index}`}
        renderItem={renderInvoice}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          loading && !refreshing ? null : (
            <Text style={styles.empty}>{listError ? ' ' : 'Không có hóa đơn phù hợp.'}</Text>
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f1f5f9' },
  listContent: { paddingBottom: 24, paddingHorizontal: 12, flexGrow: 1 },
  kpiScroll: { marginTop: 8, marginBottom: 10 },
  kpiCard: {
    width: 148,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  kpiAccent: { borderColor: '#0ea5e9', backgroundColor: '#f0f9ff' },
  kpiLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  kpiVal: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10
  },
  chipRow: { marginBottom: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  chipActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  chipText: { fontSize: 13, color: '#334155' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  sortTitle: { fontSize: 12, color: '#64748b', marginBottom: 6 },
  bannerErr: { color: '#b91c1c', marginBottom: 8, fontSize: 13 },
  centerPad: { alignItems: 'center', paddingVertical: 20 },
  hint: { marginTop: 8, color: '#64748b', fontSize: 13 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0'
  },
  cellLabel: {
    width: 130,
    fontSize: 13,
    color: '#64748b',
    paddingRight: 8
  },
  cellVal: { flex: 1, fontSize: 14, color: '#0f172a' },
  cardRowLast: { borderBottomWidth: 0 },
  footer: { paddingVertical: 16, alignItems: 'center' },
  footerMeta: { fontSize: 13, color: '#64748b', marginBottom: 10 },
  pager: { flexDirection: 'row', gap: 12 },
  pageBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 24, fontSize: 15 }
})
