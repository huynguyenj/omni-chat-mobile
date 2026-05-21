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
  Calculator,
  ChevronRight,
  Coins,
  Scale,
  Search,
  TrendingDown,
  User,
  Wallet
} from 'lucide-react-native'
import { ManagerWalletApi } from '../api/manager-wallet-api'
import type { ManagerCustomerWalletItem, ManagerWalletTransaction } from '../types/manager-wallet-type'
import { formatDateTime } from '../utils/claimsNormalize'
import {
  customerInitial,
  formatWalletMoney,
  transactionTypeLabel
} from '../utils/managerWalletNormalize'

const PRIMARY = '#3b6ea5'

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

  const renderTx = ({ item }: { item: ManagerWalletTransaction }) => (
    <View style={styles.txRow}>
      <View style={styles.txMain}>
        <Text style={styles.txType}>{transactionTypeLabel(item.transactionType)}</Text>
        <Text style={styles.txDate}>{formatDateTime(item.createDate)}</Text>
      </View>
      <Text style={styles.txAmount}>{formatWalletMoney(item.amount)} đ</Text>
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
            <View style={styles.walletBoxHead}>
              <Wallet size={14} color={PRIMARY} strokeWidth={2.2} />
              <Text style={styles.walletBoxLabel}>Số dư ví</Text>
            </View>
            <Text style={styles.walletBoxVal}>{formatWalletMoney(w.amount)} đ</Text>
          </View>
          <View style={styles.walletBox}>
            <View style={styles.walletBoxHead}>
              <Calculator size={14} color={PRIMARY} strokeWidth={2.2} />
              <Text style={styles.walletBoxLabel}>Tổng nợ</Text>
            </View>
            <Text style={[styles.walletBoxVal, styles.walletDebtVal]}>{formatWalletMoney(w.totalDebt)} đ</Text>
          </View>
          <View style={styles.walletBox}>
            <View style={styles.walletBoxHead}>
              <Scale size={14} color={PRIMARY} strokeWidth={2.2} />
              <Text style={styles.walletBoxLabel}>Số dư ròng</Text>
            </View>
            <Text style={[styles.walletBoxVal, { color: netColor }]}>{formatWalletMoney(w.netAmount)} đ</Text>
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

  const listHeader = (
    <View>
      <Text style={styles.screenTitle}>Ví tiền</Text>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, styles.kpiCardWallet]}>
          <View style={styles.kpiCardTop}>
            <Coins size={18} color="#15803d" strokeWidth={2.2} />
            <Text style={styles.kpiLabel} numberOfLines={2}>
              Tổng ví
            </Text>
          </View>
          <Text style={[styles.kpiVal, styles.kpiValWallet]} numberOfLines={1} adjustsFontSizeToFit>
            {formatWalletMoney(kpi.totalWallet)} đ
          </Text>
        </View>
        <View style={[styles.kpiCard, styles.kpiCardDebt]}>
          <View style={styles.kpiCardTop}>
            <TrendingDown size={18} color="#b45309" strokeWidth={2.2} />
            <Text style={styles.kpiLabel} numberOfLines={2}>
              Tổng công nợ
            </Text>
          </View>
          <Text style={[styles.kpiVal, styles.kpiValDebt]} numberOfLines={1} adjustsFontSizeToFit>
            {formatWalletMoney(kpi.totalDebt)} đ
          </Text>
        </View>
        <View style={[styles.kpiCard, styles.kpiCardNet]}>
          <View style={styles.kpiCardTop}>
            <Scale size={18} color={PRIMARY} strokeWidth={2.2} />
            <Text style={styles.kpiLabel} numberOfLines={2}>
              Số dư ròng
            </Text>
          </View>
          <Text style={[styles.kpiVal, { color: netAmountColor(kpi.netSum) }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatWalletMoney(kpi.netSum)} đ
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
      {loading && !refreshing ? (
        <View style={styles.centerPad}>
          <ActivityIndicator size="large" />
          <Text style={styles.hint}>Đang tải danh sách ví…</Text>
        </View>
      ) : null}
    </View>
  )

  const txList = historyCustomer?.getWalletResponse?.transactions ?? []

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <FlatList
        data={loading && !refreshing ? [] : filtered}
        keyExtractor={(item, index) => item.id || `w-${index}`}
        renderItem={renderCustomer}
        ListHeaderComponent={listHeader}
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
  screenTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  listContent: { paddingBottom: 28, paddingHorizontal: 16, flexGrow: 1 },
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
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a'
  },
  kpiCardDebt: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa'
  },
  kpiCardNet: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe'
  },
  kpiCardTop: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  kpiLabel: { fontSize: 10, fontWeight: '600', color: '#64748b', flex: 1, minWidth: 0 },
  kpiVal: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  kpiValWallet: { color: '#15803d' },
  kpiValDebt: { color: '#b45309' },
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
  centerPad: { alignItems: 'center', paddingVertical: 20 },
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
  walletRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  walletBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#bfdbfe'
  },
  walletBoxHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  walletBoxLabel: { fontSize: 10, fontWeight: '600', color: '#64748b', flex: 1 },
  walletBoxVal: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  walletDebtVal: { color: '#b45309' },
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
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#0f172a', paddingRight: 12 },
  modalClose: { paddingVertical: 6, paddingHorizontal: 10 },
  modalCloseText: { fontSize: 16, color: PRIMARY, fontWeight: '600' },
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
