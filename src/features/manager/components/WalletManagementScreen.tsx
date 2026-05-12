import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import { ManagerWalletApi } from '../api/manager-wallet-api'
import type { ManagerCustomerWalletItem, ManagerWalletTransaction } from '../types/manager-wallet-type'
import { formatDateTime } from '../utils/claimsNormalize'
import {
  customerInitial,
  formatWalletMoney,
  transactionTypeLabel
} from '../utils/managerWalletNormalize'

const WALLET_PAGE_SIZE = 6

function netAmountColor(net: number) {
  if (net < 0) return '#dc2626'
  if (net > 0) return '#16a34a'
  return '#64748b'
}

function WalletAvatar({ name, url }: { name: string; url: string }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    setFailed(false)
  }, [url])
  const initial = customerInitial(name)
  if (url && !failed) {
    return <Image source={{ uri: url }} style={styles.avatarImg} onError={() => setFailed(true)} resizeMode="cover" />
  }
  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarFallbackText}>{initial}</Text>
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
  const [walletPage, setWalletPage] = useState(1)
  const [historyCustomer, setHistoryCustomer] = useState<ManagerCustomerWalletItem | null>(null)

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

  const kpi = useMemo(() => {
    let totalWallet = 0
    let totalDebt = 0
    let netSum = 0
    for (const c of filtered) {
      const w = c.getWalletResponse
      totalWallet += w.amount
      totalDebt += w.totalDebt
      netSum += w.netAmount
    }
    return { totalWallet, totalDebt, netSum }
  }, [filtered])

  useEffect(() => {
    setWalletPage(1)
  }, [debouncedSearch])

  const totalUiPages = Math.max(1, Math.ceil(filtered.length / WALLET_PAGE_SIZE))
  const safePage = Math.min(walletPage, totalUiPages)

  useEffect(() => {
    setWalletPage((p) => Math.min(p, totalUiPages))
  }, [totalUiPages])

  const pageSlice = useMemo(() => {
    const page = Math.min(walletPage, totalUiPages)
    const start = (page - 1) * WALLET_PAGE_SIZE
    return filtered.slice(start, start + WALLET_PAGE_SIZE)
  }, [filtered, walletPage, totalUiPages])

  const renderTx = ({ item }: { item: ManagerWalletTransaction }) => (
    <View style={styles.txRow}>
      <View style={styles.txMain}>
        <Text style={styles.txType}>{transactionTypeLabel(item.transactionType)}</Text>
        <Text style={styles.txDate}>{formatDateTime(item.createDate)}</Text>
      </View>
      <Text style={styles.txAmount}>{formatWalletMoney(item.amount)} ₫</Text>
    </View>
  )

  const renderCustomer = ({ item }: { item: ManagerCustomerWalletItem }) => {
    const w = item.getWalletResponse
    const netColor = netAmountColor(w.netAmount)
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
        <View style={styles.walletRow}>
          <View style={styles.walletBox}>
            <Text style={styles.walletBoxLabel}>Số dư ví</Text>
            <Text style={styles.walletBoxVal}>{formatWalletMoney(w.amount)} ₫</Text>
          </View>
          <View style={styles.walletBox}>
            <Text style={styles.walletBoxLabel}>Tổng nợ</Text>
            <Text style={styles.walletBoxVal}>{formatWalletMoney(w.totalDebt)} ₫</Text>
          </View>
          <View style={styles.walletBox}>
            <Text style={styles.walletBoxLabel}>Số dư ròng</Text>
            <Text style={[styles.walletBoxVal, { color: netColor }]}>{formatWalletMoney(w.netAmount)} ₫</Text>
          </View>
        </View>
        <View style={styles.activityBlock}>
          <Text style={styles.activityTitle}>Hoạt động khác</Text>
          <Text style={styles.activityLine}>
            Tổng đơn: <Text style={styles.activityVal}>{item.totalOrder}</Text>
          </Text>
          <Text style={styles.activityLine}>
            Tổng thanh toán: <Text style={styles.activityVal}>{formatWalletMoney(item.totalPayment)} ₫</Text>
          </Text>
        </View>
        <Pressable style={styles.historyBtn} onPress={() => setHistoryCustomer(item)}>
          <Text style={styles.historyBtnText}>Lịch sử giao dịch</Text>
        </Pressable>
      </View>
    )
  }

  const listHeader = (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiScroll}>
        <View style={[styles.kpiCard, styles.kpiAccent]}>
          <Text style={styles.kpiLabel}>Tổng ví</Text>
          <Text style={styles.kpiVal}>{formatWalletMoney(kpi.totalWallet)} ₫</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Tổng công nợ</Text>
          <Text style={styles.kpiVal}>{formatWalletMoney(kpi.totalDebt)} ₫</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Số dư ròng</Text>
          <Text style={[styles.kpiVal, { color: netAmountColor(kpi.netSum) }]}>{formatWalletMoney(kpi.netSum)} ₫</Text>
        </View>
      </ScrollView>
      <TextInput
        style={styles.search}
        placeholder="Tìm theo tên, mã, email, SĐT…"
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
      />
      {listError ? <Text style={styles.bannerErr}>{listError}</Text> : null}
      {loading && !refreshing ? (
        <View style={styles.centerPad}>
          <ActivityIndicator size="large" />
          <Text style={styles.hint}>Đang tải danh sách ví…</Text>
        </View>
      ) : null}
    </View>
  )

  const listFooter = (
    <View style={styles.footer}>
      <Text style={styles.footerMeta}>
        {filtered.length} khách · Trang {safePage}/{totalUiPages}
      </Text>
      <View style={styles.pager}>
        <Pressable
          style={[styles.pageBtn, safePage <= 1 && styles.pageBtnDisabled]}
          disabled={safePage <= 1}
          onPress={() => setWalletPage((p) => Math.max(1, p - 1))}
        >
          <Text style={styles.pageBtnText}>Trước</Text>
        </Pressable>
        <Pressable
          style={[styles.pageBtn, safePage >= totalUiPages && styles.pageBtnDisabled]}
          disabled={safePage >= totalUiPages}
          onPress={() => setWalletPage((p) => Math.min(totalUiPages, p + 1))}
        >
          <Text style={styles.pageBtnText}>Sau</Text>
        </Pressable>
      </View>
    </View>
  )

  const txList = historyCustomer?.getWalletResponse?.transactions ?? []

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <FlatList
        data={loading && !refreshing ? [] : pageSlice}
        keyExtractor={(item, index) => item.id || `w-${index}`}
        renderItem={renderCustomer}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          loading && !refreshing ? null : (
            <Text style={styles.empty}>{listError ? ' ' : 'Không có khách phù hợp.'}</Text>
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <Modal visible={!!historyCustomer} animationType="slide" transparent={false} onRequestClose={() => setHistoryCustomer(null)}>
        <SafeAreaView style={styles.modalSafe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              Lịch sử — {historyCustomer?.customerName ?? ''}
            </Text>
            <Pressable hitSlop={12} onPress={() => setHistoryCustomer(null)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </Pressable>
          </View>
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
  listContent: { paddingBottom: 24, paddingHorizontal: 12, flexGrow: 1 },
  kpiScroll: { marginTop: 8, marginBottom: 10 },
  kpiCard: {
    width: 156,
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
  cardHeader: { flexDirection: 'row', marginBottom: 12 },
  avatarImg: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#e2e8f0' },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarFallbackText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  cardHeaderText: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  customerName: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  subLine: { fontSize: 13, color: '#64748b', marginTop: 2 },
  walletRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  walletBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  walletBoxLabel: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  walletBoxVal: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  activityBlock: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  activityTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  activityLine: { fontSize: 13, color: '#64748b', marginTop: 2 },
  activityVal: { fontWeight: '600', color: '#0f172a' },
  historyBtn: {
    backgroundColor: '#0369a1',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center'
  },
  historyBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
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
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#0f172a', paddingRight: 12 },
  modalClose: { paddingVertical: 6, paddingHorizontal: 10 },
  modalCloseText: { fontSize: 16, color: '#0369a1', fontWeight: '600' },
  emptyModal: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 15 },
  txListContent: { padding: 16, paddingBottom: 32 },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0'
  },
  txMain: { flex: 1, paddingRight: 12 },
  txType: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  txDate: { fontSize: 12, color: '#64748b', marginTop: 4 },
  txAmount: { fontSize: 15, fontWeight: '700', color: '#0f172a' }
})
