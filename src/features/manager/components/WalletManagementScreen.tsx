import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  Tag,
  User,
  Wallet,
  X
} from 'lucide-react-native'
import { ManagerWalletApi } from '../api/manager-wallet-api'
import type { ManagerCustomerWalletItem, ManagerWalletTransaction } from '../types/manager-wallet-type'
import {
  customerInitial,
  formatWalletMoney,
  formatWalletTxDateTime,
  transactionAmountColor,
  transactionTypeLabel
} from '../utils/managerWalletNormalize'

const PRIMARY = '#3b6ea5'
const WALLET_PAGE_SIZE = 6

function WalletAvatar({ name, url }: { name: string; url: string }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    setFailed(false)
  }, [url])
  const initial = customerInitial(name)
  return (
    <View style={styles.avatarWrap}>
      {url && !failed ? (
        <Image source={{ uri: url }} style={styles.avatarImg} onError={() => setFailed(true)} resizeMode="cover" />
      ) : (
        <View style={styles.avatarFallback}>
          <User size={28} color="#fff" strokeWidth={2} />
        </View>
      )}
      <View style={styles.avatarBadge}>
        <Text style={styles.avatarBadgeText}>{initial}</Text>
      </View>
    </View>
  )
}

export default function WalletManagementScreen() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [allCustomers, setAllCustomers] = useState<ManagerCustomerWalletItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [historyCustomer, setHistoryCustomer] = useState<ManagerCustomerWalletItem | null>(null)
  const [uiPage, setUiPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  const loadAll = useCallback(async () => {
    const merged = await ManagerWalletApi.fetchAllCustomerWallets()
    setAllCustomers(merged)
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
          const msg = typeof e === 'string' ? e : 'Không tải được ví khách hàng.'
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

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return allCustomers
    return allCustomers.filter((c) => {
      const fields = [c.customerName, c.id, c.email, c.phoneNumber].map((x) => (x || '').toLowerCase())
      return fields.some((f) => f.includes(q))
    })
  }, [allCustomers, debouncedSearch])

  useEffect(() => {
    setUiPage(1)
  }, [debouncedSearch])

  const totalUiPages = Math.max(1, Math.ceil(filtered.length / WALLET_PAGE_SIZE))
  const pageSlice = useMemo(() => {
    const page = Math.min(uiPage, totalUiPages)
    const start = (page - 1) * WALLET_PAGE_SIZE
    return filtered.slice(start, start + WALLET_PAGE_SIZE)
  }, [filtered, uiPage, totalUiPages])

  const kpi = useMemo(() => {
    let totalWalletAmount = 0
    let totalDebt = 0
    for (const c of filtered) {
      const w = c.getWalletResponse
      totalWalletAmount += w.amount
      totalDebt += w.totalDebt
    }
    return { totalWalletAmount, totalDebt }
  }, [filtered])

  const renderTx = ({ item }: { item: ManagerWalletTransaction }) => (
    <View style={styles.txCard}>
      <Text style={styles.txType}>{transactionTypeLabel(item.transactionType)}</Text>
      <View style={styles.txMeta}>
        <Clock size={14} color="#64748b" strokeWidth={2} />
        <Text style={styles.txDate}>{formatWalletTxDateTime(item.createDate)}</Text>
      </View>
      <Text style={[styles.txAmount, { color: transactionAmountColor(item.transactionType) }]}>
        {formatWalletMoney(item.amount)} đ
      </Text>
    </View>
  )

  const renderCustomer = ({ item }: { item: ManagerCustomerWalletItem }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <WalletAvatar name={item.customerName} url={item.avatarUrl} />
          <View style={styles.cardHeaderText}>
            <Text style={styles.customerName}>{item.customerName || '—'}</Text>
            <Text style={styles.subLine} numberOfLines={1}>
              {item.email || '—'}
            </Text>
            <Text style={styles.subLine}>{item.phoneNumber || '—'}</Text>
          </View>
        </View>

        <View style={styles.activityBlock}>
          <Text style={styles.activityTitle}>Thống kê hoạt động</Text>
          <Text style={styles.activityLine}>
            Tổng đơn: <Text style={styles.activityVal}>{item.totalOrder}</Text>
          </Text>
          <Text style={styles.activityLine}>
            Tổng thanh toán: <Text style={styles.activityVal}>{formatWalletMoney(item.totalPayment)} đ</Text>
          </Text>
        </View>

        <Pressable style={styles.historyBtn} onPress={() => setHistoryCustomer(item)}>
          <Text style={styles.historyBtnText}>Lịch sử giao dịch</Text>
          <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
        </Pressable>
      </View>
    )
  }

  const fixedHeader = (
    <View style={styles.fixedTop}>
      <Text style={styles.screenTitle}>Ví tiền</Text>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, styles.kpiCardWallet]}>
          <View style={styles.kpiCardTop}>
            <Wallet size={18} color="#1d4ed8" strokeWidth={2.2} />
            <Text style={[styles.kpiLabel, styles.kpiLabelWallet]} numberOfLines={2}>
              Ví tiền
            </Text>
          </View>
          <Text style={[styles.kpiVal, styles.kpiValWallet]} numberOfLines={1} adjustsFontSizeToFit>
            {formatWalletMoney(kpi.totalWalletAmount)} đ
          </Text>
        </View>
        <View style={[styles.kpiCard, styles.kpiCardDebt]}>
          <View style={styles.kpiCardTop}>
            <Tag size={18} color="#dc2626" strokeWidth={2.2} />
            <Text style={[styles.kpiLabel, styles.kpiLabelDebt]} numberOfLines={2}>
              Tổng nợ
            </Text>
          </View>
          <Text style={[styles.kpiVal, styles.kpiValDebt]} numberOfLines={1} adjustsFontSizeToFit>
            {formatWalletMoney(kpi.totalDebt)} đ
          </Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Search size={20} color="#64748b" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên, mã, email, SĐT..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {listError ? <Text style={styles.bannerErr}>{listError}</Text> : null}
    </View>
  )

  const txList = historyCustomer?.getWalletResponse?.transactions ?? []

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      {fixedHeader}

      <View style={styles.listPane}>
        {loading && !refreshing ? (
          <View style={styles.centerPad}>
            <ActivityIndicator size="large" />
            <Text style={styles.hint}>Đang tải danh sách ví…</Text>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={pageSlice}
            keyExtractor={(item, index) => item.id || `w-${index}`}
            renderItem={renderCustomer}
            ListEmptyComponent={
              <Text style={styles.empty}>{listError ? ' ' : 'Không có khách phù hợp.'}</Text>
            }
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>

      {!loading || refreshing ? (
        <View style={styles.pagerFixed}>
          <Text style={styles.footerMeta}>
            {filtered.length} khách · Trang {Math.min(uiPage, totalUiPages)}/{totalUiPages}
          </Text>
          <View style={styles.pager}>
            <Pressable
              style={[styles.pageBtn, uiPage <= 1 && styles.pageBtnDisabled]}
              disabled={uiPage <= 1}
              onPress={() => setUiPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={18} color={uiPage <= 1 ? '#94a3b8' : '#0f172a'} strokeWidth={2.2} />
              <Text style={[styles.pageBtnText, uiPage <= 1 && styles.pageBtnTextDisabled]}>Trước</Text>
            </Pressable>
            <Pressable
              style={[styles.pageBtn, uiPage >= totalUiPages && styles.pageBtnDisabled]}
              disabled={uiPage >= totalUiPages}
              onPress={() => setUiPage((p) => Math.min(totalUiPages, p + 1))}
            >
              <Text style={[styles.pageBtnText, uiPage >= totalUiPages && styles.pageBtnTextDisabled]}>Sau</Text>
              <ChevronRight size={18} color={uiPage >= totalUiPages ? '#94a3b8' : '#0f172a'} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>
      ) : null}

      <Modal visible={!!historyCustomer} animationType="slide" transparent={false} onRequestClose={() => setHistoryCustomer(null)}>
        <SafeAreaView style={styles.modalSafe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              Lịch sử giao dịch — {historyCustomer?.customerName ?? ''}
            </Text>
            <Pressable hitSlop={12} onPress={() => setHistoryCustomer(null)} style={styles.modalCloseBtn}>
              <X size={18} color="#003366" strokeWidth={2.2} />
            </Pressable>
          </View>
          {historyCustomer ? (
            <View style={styles.histSummary}>
              <View style={styles.histSummaryCol}>
                <Text style={styles.histSummaryLabel}>Ví tiền</Text>
                <Text style={styles.histSummaryValWallet}>
                  {formatWalletMoney(historyCustomer.getWalletResponse.amount)} đ
                </Text>
              </View>
              <View style={styles.histSummaryCol}>
                <Text style={styles.histSummaryLabel}>Tổng nợ</Text>
                <Text style={styles.histSummaryValDebt}>
                  {formatWalletMoney(historyCustomer.getWalletResponse.totalDebt)} đ
                </Text>
              </View>
            </View>
          ) : null}
          {txList.length === 0 ? (
            <Text style={styles.emptyModal}>Chưa có giao dịch.</Text>
          ) : (
            <FlatList
              data={txList}
              keyExtractor={(t, i) => t.id || `tx-${i}`}
              renderItem={renderTx}
              contentContainerStyle={styles.txListContent}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f1f5f9' },
  fixedTop: { paddingHorizontal: 16, paddingTop: 4, backgroundColor: '#f1f5f9' },
  listPane: { flex: 1, minHeight: 0 },
  list: { flex: 1 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  listContent: { paddingBottom: 24, paddingHorizontal: 16, flexGrow: 1 },
  kpiRow: { flexDirection: 'row', gap: 6, marginBottom: 12, alignItems: 'stretch' },
  kpiCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderWidth: 1
  },
  kpiCardWallet: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe'
  },
  kpiCardDebt: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca'
  },
  kpiCardPaid: {
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0'
  },
  kpiCardTop: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  kpiLabel: { fontSize: 10, fontWeight: '700', flex: 1, minWidth: 0, textTransform: 'uppercase' },
  kpiLabelWallet: { color: '#1d4ed8' },
  kpiLabelDebt: { color: '#dc2626' },
  kpiLabelPaid: { color: '#15803d' },
  kpiVal: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  kpiValWallet: { color: '#1d4ed8' },
  kpiValDebt: { color: '#dc2626' },
  kpiValPaid: { color: '#15803d' },
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e2e8f0' },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 4
  },
  avatarBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  cardHeaderText: { flex: 1, marginLeft: 12, justifyContent: 'center', minWidth: 0 },
  customerName: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  subLine: { fontSize: 13, color: '#64748b', marginTop: 2 },
  activityBlock: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  activityTitle: { fontSize: 13, fontWeight: '800', color: '#334155', marginBottom: 6 },
  activityLine: { fontSize: 13, color: '#64748b', marginTop: 2 },
  activityVal: { fontWeight: '700', color: '#0f172a' },
  historyBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8
  },
  historyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 24, fontSize: 15 },
  modalSafe: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0'
  },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#003366', paddingRight: 12 },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyModal: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 15 },
  histSummary: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8
  },
  histSummaryCol: { flex: 1, minWidth: 0, alignItems: 'center' },
  histSummaryLabel: { fontSize: 11, fontWeight: '600', color: '#64748b', marginBottom: 4, textAlign: 'center' },
  histSummaryValWallet: { fontSize: 14, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  histSummaryValDebt: { fontSize: 14, fontWeight: '800', color: '#dc2626', textAlign: 'center' },
  histSummaryValPaid: { fontSize: 14, fontWeight: '800', color: '#15803d', textAlign: 'center' },
  txListContent: { paddingHorizontal: 16, paddingBottom: 32 },
  txCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  txType: { fontSize: 15, fontWeight: '700', color: '#003366' },
  txMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  txDate: { fontSize: 12, color: '#64748b' },
  txAmount: { fontSize: 16, fontWeight: '800', marginTop: 8 },
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
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  pageBtnDisabled: { opacity: 0.5 },
  pageBtnText: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  pageBtnTextDisabled: { color: '#94a3b8' }
})
