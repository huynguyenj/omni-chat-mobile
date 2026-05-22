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
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Mail,
  RotateCcw,
  Search,
  Wallet
} from 'lucide-react-native'
import { ManagerInvoiceApi } from '../api/manager-invoice-api'
import type { ManagerInvoiceItem, ManagerInvoiceStatusFilter } from '../types/manager-invoice-type'
import { formatDateTime } from '../utils/claimsNormalize'
import { formatKpiMoney, normInvoiceStatus } from '../utils/managerInvoicesNormalize'

const INVOICE_PAGE_SIZE = 10

const STATUS_CHIPS: { value: ManagerInvoiceStatusFilter; label: string }[] = [
  { value: null, label: 'Tất cả' },
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'completed', label: 'Đã thanh toán' },
  { value: 'pendingrefund', label: 'Quá hạn' },
  { value: 'refunded', label: 'Đã hoàn tiền' }
]

function invoiceStatusLabelVi(status: string): string {
  const n = normInvoiceStatus(status)
  if (n === 'completed') return 'Đã thanh toán'
  if (n === 'pending') return 'Chờ thanh toán'
  if (n === 'pendingrefund') return 'Quá hạn'
  if (n === 'refunded') return 'Đã hoàn tiền'
  return status || '—'
}

function invoiceProgress(status: string): { ratio: number; color: string } {
  const n = normInvoiceStatus(status)
  if (n === 'completed') return { ratio: 1, color: '#22c55e' }
  if (n === 'refunded') return { ratio: 1, color: '#94a3b8' }
  if (n === 'pendingrefund') return { ratio: 0.72, color: '#f97316' }
  if (n === 'pending') return { ratio: 0.38, color: '#eab308' }
  return { ratio: 0.15, color: '#cbd5e1' }
}

export default function InvoicesManagementScreen() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ManagerInvoiceStatusFilter>(null)

  const [allInvoices, setAllInvoices] = useState<ManagerInvoiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const [uiPage, setUiPage] = useState(1)
  const [simulateFrom, setSimulateFrom] = useState('')
  const [simulateTo, setSimulateTo] = useState('')
  const [simulating, setSimulating] = useState(false)

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

  useEffect(() => {
    setUiPage(1)
  }, [statusFilter, debouncedSearch])

  const totalUiPages = Math.max(1, Math.ceil(filtered.length / INVOICE_PAGE_SIZE))
  const safeUiPage = Math.min(uiPage, totalUiPages)

  useEffect(() => {
    setUiPage((p) => Math.min(p, totalUiPages))
  }, [totalUiPages])

  const pageSlice = useMemo(() => {
    const page = Math.min(uiPage, totalUiPages)
    const start = (page - 1) * INVOICE_PAGE_SIZE
    return filtered.slice(start, start + INVOICE_PAGE_SIZE)
  }, [filtered, uiPage, totalUiPages])

  const handleRunInvoices = async () => {
    setSimulating(true)
    try {
      const msg = await ManagerInvoiceApi.runInvoices({
        from: simulateFrom.trim() || undefined,
        to: simulateTo.trim() || undefined
      })
      Toast.show({ type: 'success', text1: msg })
      await loadAll()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Chạy giả lập thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setSimulating(false)
    }
  }

  const selectStatus = (v: ManagerInvoiceStatusFilter) => {
    setStatusFilter(v)
  }

  const renderInvoice = ({ item, index }: { item: ManagerInvoiceItem; index: number }) => {
    const stt = (safeUiPage - 1) * INVOICE_PAGE_SIZE + index + 1
    const st = normInvoiceStatus(item.invoiceStatus)
    const prog = invoiceProgress(item.invoiceStatus)
    const done = st === 'completed'
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>STT</Text>
          <Text style={styles.cellValStrong}>{stt}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>Tên khách hàng</Text>
          <Text style={styles.cellValStrong} numberOfLines={2}>
            {item.customerName || '—'}
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>Email</Text>
          <View style={styles.emailRow}>
            <Text style={styles.cellVal} numberOfLines={2}>
              {item.customerEmail || '—'}
            </Text>
            <Mail size={18} color="#64748b" strokeWidth={2} />
          </View>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>SĐT</Text>
          <Text style={styles.cellVal}>{item.customerPhoneNumber || '—'}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cellLabel}>Phương thức</Text>
          <View style={styles.methodPill}>
            <Building2 size={14} color="#1e40af" strokeWidth={2} />
            <Text style={styles.methodPillText} numberOfLines={1}>
              {item.invoiceMethod || '—'}
            </Text>
          </View>
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
          <Text style={styles.cellMoney}>{formatKpiMoney(item.total)} đ</Text>
        </View>
        <View style={[styles.cardRow, styles.cardRowLast]}>
          <Text style={styles.cellLabel}>Trạng thái</Text>
          <View style={styles.statusRow}>
            {done ? <Check size={18} color="#16a34a" strokeWidth={2.5} /> : null}
            <Text style={[styles.cellStatus, done && styles.cellStatusDone]}>
              {invoiceStatusLabelVi(item.invoiceStatus)}
            </Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { flex: Math.max(0.02, prog.ratio), backgroundColor: prog.color }]} />
          <View style={{ flex: Math.max(0.02, 1 - prog.ratio), backgroundColor: '#f1f5f9' }} />
        </View>
      </View>
    )
  }

  const fixedHeader = (
    <View style={styles.fixedTop}>
      <Text style={styles.screenTitle}>Phiếu thanh toán</Text>

      <View style={styles.kpiPrimaryRow}>
        <View style={styles.kpiCardMain}>
          <View style={styles.kpiCardHead}>
            <View style={styles.kpiIconBg}>
              <CircleDollarSign size={16} color="#0369a1" strokeWidth={2.2} />
            </View>
            <Text style={styles.kpiLabel}>Tổng tiền</Text>
          </View>
          <Text style={styles.kpiVal}>{formatKpiMoney(kpi.totalAll)} đ</Text>
        </View>
        <View style={styles.kpiCardMain}>
          <View style={styles.kpiCardHead}>
            <View style={[styles.kpiIconBg, styles.kpiIconBgGreen]}>
              <Wallet size={16} color="#15803d" strokeWidth={2.2} />
            </View>
            <Text style={styles.kpiLabel}>Đã thanh toán</Text>
          </View>
          <Text style={styles.kpiVal}>{formatKpiMoney(kpi.paidCompleted)} đ</Text>
        </View>
        <View style={styles.kpiCardMain}>
          <View style={styles.kpiCardHead}>
            <View style={[styles.kpiIconBg, styles.kpiIconBgAmber]}>
              <Clock size={16} color="#b45309" strokeWidth={2.2} />
            </View>
            <Text style={styles.kpiLabel}>Chờ thanh toán</Text>
          </View>
          <Text style={styles.kpiVal}>{formatKpiMoney(kpi.pendingSum)} đ</Text>
        </View>
      </View>

      <View style={styles.kpiSecondaryRow}>
        <View style={styles.kpiCardSmall}>
          <View style={styles.kpiCardHead}>
            <AlertTriangle size={15} color="#c2410c" strokeWidth={2} />
            <Text style={styles.kpiLabelSm}>Quá hạn</Text>
          </View>
          <Text style={styles.kpiValSm}>{formatKpiMoney(kpi.pendingRefundSum)} đ</Text>
        </View>
        <View style={styles.kpiCardSmall}>
          <View style={styles.kpiCardHead}>
            <RotateCcw size={15} color="#475569" strokeWidth={2} />
            <Text style={styles.kpiLabelSm}>Đã hoàn tiền</Text>
          </View>
          <Text style={styles.kpiValSm}>{formatKpiMoney(kpi.refundedSum)} đ</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Search size={20} color="#64748b" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo mã, khách, email, SĐT..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {STATUS_CHIPS.map((c) => {
          const active = statusFilter === c.value
          return (
            <Pressable
              key={String(c.value)}
              style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
              onPress={() => selectStatus(c.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <View style={styles.simulateRow}>
        <TextInput
          style={styles.simInput}
          placeholder="Từ (ISO, vd 2026-05-01T00:00)"
          placeholderTextColor="#94a3b8"
          value={simulateFrom}
          onChangeText={setSimulateFrom}
        />
        <TextInput
          style={styles.simInput}
          placeholder="Đến (ISO)"
          placeholderTextColor="#94a3b8"
          value={simulateTo}
          onChangeText={setSimulateTo}
        />
        <Pressable style={styles.simBtn} onPress={handleRunInvoices} disabled={simulating}>
          <Text style={styles.simBtnText}>{simulating ? '…' : 'Chạy'}</Text>
        </Pressable>
      </View>

      {listError ? <Text style={styles.bannerErr}>{listError}</Text> : null}
    </View>
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      {fixedHeader}

      <View style={styles.listPane}>
        {loading && !refreshing ? (
          <View style={styles.centerPad}>
            <ActivityIndicator size="large" />
            <Text style={styles.hint}>Đang tải toàn bộ hóa đơn…</Text>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={pageSlice}
            keyExtractor={(item, index) => item.id || `inv-${index}`}
            renderItem={renderInvoice}
            ListEmptyComponent={
              <Text style={styles.empty}>{listError ? ' ' : 'Không có hóa đơn phù hợp.'}</Text>
            }
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>

      {!loading || refreshing ? (
        <View style={styles.pagerFixed}>
          <Text style={styles.footerMeta}>
            {filtered.length} hóa đơn · Trang {safeUiPage}/{totalUiPages}
          </Text>
          <View style={styles.pager}>
            <Pressable
              style={[styles.pageBtn, safeUiPage <= 1 && styles.pageBtnDisabled]}
              disabled={safeUiPage <= 1}
              onPress={() => setUiPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={18} color={safeUiPage <= 1 ? '#94a3b8' : '#0f172a'} strokeWidth={2.2} />
              <Text style={[styles.pageBtnText, safeUiPage <= 1 && styles.pageBtnTextDisabled]}>Trước</Text>
            </Pressable>
            <Pressable
              style={[styles.pageBtn, safeUiPage >= totalUiPages && styles.pageBtnDisabled]}
              disabled={safeUiPage >= totalUiPages}
              onPress={() => setUiPage((p) => Math.min(totalUiPages, p + 1))}
            >
              <Text style={[styles.pageBtnText, safeUiPage >= totalUiPages && styles.pageBtnTextDisabled]}>Sau</Text>
              <ChevronRight size={18} color={safeUiPage >= totalUiPages ? '#94a3b8' : '#0f172a'} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f1f5f9' },
  fixedTop: { paddingHorizontal: 16, paddingTop: 4, backgroundColor: '#f1f5f9' },
  listPane: { flex: 1, minHeight: 0 },
  list: { flex: 1 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  listContent: { paddingBottom: 12, paddingHorizontal: 16, flexGrow: 1 },
  kpiPrimaryRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  kpiCardMain: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0'
  },
  kpiCardHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  kpiIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center'
  },
  kpiIconBgGreen: { backgroundColor: '#dcfce7' },
  kpiIconBgAmber: { backgroundColor: '#fef3c7' },
  kpiLabel: { fontSize: 10, fontWeight: '600', color: '#64748b', flex: 1 },
  kpiVal: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  kpiSecondaryRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpiCardSmall: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  kpiLabelSm: { fontSize: 11, fontWeight: '600', color: '#64748b', marginLeft: 4, flex: 1 },
  kpiValSm: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12
  },
  searchInput: { flex: 1, fontSize: 15, color: '#0f172a', paddingVertical: 0 },
  chipRow: { marginBottom: 8 },
  simulateRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginBottom: 8, alignItems: 'center' },
  simInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 11,
    color: '#0f172a',
    backgroundColor: '#fff'
  },
  simBtn: { backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  simBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8
  },
  chipIdle: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#93c5fd'
  },
  chipActive: { backgroundColor: '#1e40af', borderWidth: 1.5, borderColor: '#1e40af' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  chipTextActive: { color: '#fff' },
  bannerErr: { color: '#b91c1c', marginBottom: 8, fontSize: 13 },
  centerPad: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  hint: { marginTop: 8, color: '#64748b', fontSize: 13 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0'
  },
  cellLabel: {
    width: 118,
    fontSize: 13,
    color: '#64748b',
    paddingRight: 8,
    fontWeight: '500'
  },
  cellVal: { flex: 1, fontSize: 14, color: '#0f172a' },
  cellValStrong: { flex: 1, fontSize: 14, fontWeight: '800', color: '#0f172a' },
  cellMoney: { flex: 1, fontSize: 15, fontWeight: '800', color: '#16a34a' },
  cellStatus: { fontSize: 14, fontWeight: '700', color: '#334155' },
  cellStatusDone: { color: '#16a34a' },
  emailRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  methodPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  methodPillText: { fontSize: 13, fontWeight: '600', color: '#1e40af', flex: 1 },
  statusRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardRowLast: { borderBottomWidth: 0, paddingBottom: 4 },
  progressTrack: {
    flexDirection: 'row',
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: '#f1f5f9'
  },
  progressFill: { borderRadius: 3 },
  pagerFixed: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center'
  },
  footerMeta: { fontSize: 13, color: '#64748b', marginBottom: 10, fontWeight: '500' },
  pager: { flexDirection: 'row', gap: 12 },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  pageBtnDisabled: { opacity: 0.45 },
  pageBtnText: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  pageBtnTextDisabled: { color: '#94a3b8' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 24, fontSize: 15 }
})
