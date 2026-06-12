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
  Eye,
  Search,
  User,
  Wallet,
  X
} from 'lucide-react-native'
import { ManagerWalletApi } from '../api/manager-wallet-api'
import type {
  ManagerCustomerWalletItem,
  ManagerWalletResponse,
  ManagerWalletTransaction,
  PaycheckTransactionSummary
} from '../types/manager-wallet-type'
import {
  customerInitial,
  formatWalletMoney,
  formatWalletTxDateTime,
  transactionAmountColor,
  transactionTypeLabel
} from '../utils/managerWalletNormalize'
import Input from '@/components/ui/inputs/Input'
import CustomerWalletItemSkeleton from './ui/CustomerWalletItemSkeleton'
import useGetInvoiceById from '../hooks/useGetInvoiceId'
import ModalCustom from '@/components/ui/modal/ModalCustom'
import Button from '@/components/ui/buttons/Button'
import { formatDate, formatMoney } from '@/utils/format'
import Tag from '@/components/ui/tags/Tag'

const PRIMARY = '#3b6ea5'
const WALLET_PAGE_SIZE = 6

function parseTopUpAmountInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return NaN
  const n = Number(digits)
  return Number.isFinite(n) ? n : NaN
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

  function TransactionItem ({ item }: { item: ManagerWalletTransaction }) {
    const { handleGetPayInvoiceId, invoice } = useGetInvoiceById()
    
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
    const handleOpenInvoice = () => {
      setIsInvoiceOpen(prevState => !prevState)
      if (item.invoiceId) handleGetPayInvoiceId(item.invoiceId)
    }
      const payCheckStatus = (status?: string) => {
      switch (status) {
      case 'Pending': return 'Đang chờ thanh toán'
      case 'Refunded': return 'Hoàn tiền'
      case 'Completed': return 'Hoàn thành'
      case 'Cancelled': return 'Hủy'
      default: return status
      }
    }
    console.log(invoice);
    
    return (
      <>
        <View style={styles.txCard}>
          <Text style={styles.txType}>{transactionTypeLabel(item.transactionType)}</Text>
          <View style={styles.txMeta}>
            <Clock size={14} color="#64748b" strokeWidth={2} />
            <Text style={styles.txDate}>{formatWalletTxDateTime(item.createDate)}</Text>
          </View>
          <Text style={[styles.txAmount, { color: transactionAmountColor(item.transactionType) }]}>
            {item.transactionType.toLowerCase() !== 'deposit' ? '-' : '+'} {formatWalletMoney(item.amount)} đ
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            { item.invoiceId !== null &&
            <Button icon={{ iconName: Eye, iconDirection: 'center' }} onPress={handleOpenInvoice} style={{ width: 40, height: 40, borderRadius: 100 }}/>
            }
          </View>
        </View>
      
          <ModalCustom isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)}>
            <View style={ {
                  padding: 16,
                  backgroundColor: '#FFFFFF',
                }}>
            {/* Header */}
            <View style={{ marginBottom: 24,}}>
              <Text style={ {
                      fontSize: 20,
                      fontWeight: '700',
                      color: '#003366',
                    }}>Chi tiết hóa đơn</Text>
              <Text style={{    
                      marginTop: 4,
                      color: '#6B7280',
                      fontSize: 14,}}>
                Mã hóa đơn: {invoice?.id}
              </Text>
            </View>

            {/* Customer & Invoice Info */}
            <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}>
              {/* Customer */}
              <View style={{flex: 1}}>
                <Text style={ {
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#003366',
                      marginBottom: 12,
                    }}>
                  Thông tin khách hàng
                </Text>

                <View style={{ gap: 8 }}>
                  <Text style={{
                      fontSize: 14,
                      color: '#111827',
                      lineHeight: 22,
                    }}>
                    <Text style={{fontWeight: '600'}}>Họ tên: </Text>
                    {invoice?.customerName}
                  </Text>

                  <Text style={{
                      fontSize: 14,
                      color: '#111827',
                      lineHeight: 22,
                    }}>
                    <Text style={{ fontWeight: '600'}}>Số điện thoại: </Text>
                    {invoice?.customerPhoneNumber}
                  </Text>

                  <Text style={{
                        fontSize: 14,
                        color: '#111827',
                        lineHeight: 22,
                      }}>
                    <Text style={{ fontWeight: '600'}}>Email: </Text>
                    {invoice?.customerEmail}
                  </Text>

                  <Text style={{
                          fontSize: 14,
                          color: '#111827',
                          lineHeight: 22,
                        }}>
                    <Text style={{ fontWeight: '600'}}>Địa chỉ: </Text>
                    {invoice?.customerAddress}
                  </Text>
                </View>
              </View>

              {/* Invoice */}
              <View style={{ flex: 1 }}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#003366',
                    marginBottom: 12,
                  }}>
                  Thông tin hóa đơn
                </Text>

                <View style={{ gap: 1 }}>
                  <Text style={ {
                        fontSize: 14,
                        color: '#111827',
                        lineHeight: 22,
                      }}>
                    <Text style={{ fontWeight: '600'}}>Ngày bắt đầu: </Text>
                    {invoice?.startedDate
                      ? formatDate(invoice.startedDate)
                      : 'N/A'}
                  </Text>

                  <Text style={ {
                        fontSize: 14,
                        color: '#111827',
                        lineHeight: 22,
                      }}>
                    <Text style={{ fontWeight: '600'}}>Ngày kết thúc: </Text>
                    {invoice?.endedDate
                      ? formatDate(invoice.endedDate)
                      : 'N/A'}
                  </Text>

                  <Text style={
                     {
                        fontSize: 14,
                        color: '#111827',
                        lineHeight: 22,
                      }
                  }>
                    <Text style={{ fontWeight: '600'}}>Phương thức: </Text>
                    {invoice?.invoiceMethod}
                  </Text>

                  <View style={ {
                      gap: 8,
                    }}>
                    <Text style={{ fontWeight: '600'}}>Trạng thái: </Text>

                    <Tag
                      variant={
                        invoice?.invoiceStatus === 'Completed'
                          ? 'success'
                          : invoice?.invoiceStatus === 'Pending'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      <Text>
                        {payCheckStatus(invoice?.invoiceStatus)}
                      </Text>
                    </Tag>
                  </View>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={{
                height: 1,
                backgroundColor: '#E5E7EB',
                marginVertical: 24,
              }} />

            {/* Payment Info */}
            <View>
              <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#003366',
                  marginBottom: 12,
                }}>
                Thông tin thanh toán
              </Text>

              <View style={{
                  gap: 12,
                  marginTop: 12,
                }}>
                  <View style={ {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text>Tổng tiền hóa đơn</Text>
                  <Text style={ {
                      fontWeight: '600',
                      color: '#111827',
                    }}>
                    {formatMoney(invoice?.total ?? 0)}
                  </Text>
                </View>

                <View style={ {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text>Đã thanh toán</Text>
                  <Text style={ {
                      fontWeight: '600',
                      color: '#16A34A',
                    }}>
                    {formatMoney(invoice?.paidAmount ?? 0)}
                  </Text>
                </View>

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Text>Khấu trừ ví</Text>
                  <Text style={ {
                    fontWeight: '600',
                    color: '#2563EB',
                  }}>
                    {formatMoney(invoice?.deductedAmount ?? 0)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          </ModalCustom>
      </>
    )
  } 

export default function WalletManagementScreen() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [customers, setCustomers] = useState<ManagerCustomerWalletItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [historyCustomer, setHistoryCustomer] = useState<ManagerCustomerWalletItem | null>(null)
  const [historyWallet, setHistoryWallet] = useState<PaycheckTransactionSummary | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [topUpCustomer, setTopUpCustomer] = useState<ManagerCustomerWalletItem | null>(null)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpSubmitting, setTopUpSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  const loadPage = useCallback(async (pageNumber: number, searchQuery: string) => {
    const res = await ManagerWalletApi.getCustomerWalletPaging({
      pageNumber,
      pageSize: WALLET_PAGE_SIZE,
      customerName: searchQuery || undefined
    })
    setCustomers(res.items)
    setTotalPages(res.meta.total_pages)
    setTotalItems(res.meta.total_items)
    setCurrentPage(res.meta.current_page)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setListError(null)
    ;(async () => {
      try {
        await loadPage(1, debouncedSearch)
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
  }, [loadPage, debouncedSearch])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setListError(null)
    try {
      await loadPage(currentPage, debouncedSearch)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Làm mới thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setRefreshing(false)
    }
  }, [loadPage, currentPage, debouncedSearch])

  const refreshCustomerWallet = useCallback(async (customerId: string) => {
    const wallet = await ManagerWalletApi.getWalletByCustomerId(customerId)
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, getWalletResponse: wallet } : c))
    )
    return wallet
  }, [])

  const openTransactionHistory = useCallback(async (customer: ManagerCustomerWalletItem) => {
    setHistoryCustomer(customer)
    setHistoryWallet(null)
    setHistoryError(null)
    setHistoryLoading(true)
    try {
      const wallet = await ManagerWalletApi.getWalletByCustomerId(customer.id)
      setHistoryWallet(wallet)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Không thể tải lịch sử giao dịch.'
      setHistoryError(msg)
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const closeTransactionHistory = useCallback(() => {
    setHistoryCustomer(null)
    setHistoryWallet(null)
    setHistoryError(null)
    setHistoryLoading(false)
  }, [])

  const openTopUp = useCallback((customer: ManagerCustomerWalletItem) => {
    setTopUpAmount('')
    setTopUpCustomer(customer)
  }, [])

  const closeTopUp = useCallback(() => {
    if (topUpSubmitting) return
    setTopUpCustomer(null)
    setTopUpAmount('')
  }, [topUpSubmitting])

  const handleTopUpSubmit = useCallback(async () => {
    if (!topUpCustomer) return
    const amount = parseTopUpAmountInput(topUpAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập số tiền hợp lệ (lớn hơn 0).' })
      return
    }
    setTopUpSubmitting(true)
    try {
      await ManagerWalletApi.payCash({ customerId: topUpCustomer.id, amount })
      Toast.show({
        type: 'success',
        text1: `Đã nạp ${formatWalletMoney(amount)}đ cho ${topUpCustomer.customerName}.`
      })
      await refreshCustomerWallet(topUpCustomer.id)
      setTopUpCustomer(null)
      setTopUpAmount('')
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: typeof e === 'string' ? e : 'Không thể nạp tiền. Vui lòng thử lại.'
      })
    } finally {
      setTopUpSubmitting(false)
    }
  }, [topUpAmount, topUpCustomer, refreshCustomerWallet])

  const filtered = useMemo(() => {
    return customers
  }, [customers])

  const kpi = useMemo(() => {
    let totalWalletAmount = 0
    let totalDebt = 0
    for (const c of customers) {
      const w = c.getWalletResponse
      totalWalletAmount += w.amount
      totalDebt += w.totalDebt
    }
    return { totalWalletAmount, totalDebt }
  }, [customers])





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

        <Pressable
          style={[styles.historyBtn, historyLoading && historyCustomer?.id === item.id && styles.btnDisabled]}
          disabled={historyLoading && historyCustomer?.id === item.id}
          onPress={() => void openTransactionHistory(item)}
        >
          <Text style={styles.historyBtnText}>Lịch sử giao dịch</Text>
          <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
        </Pressable>
        <Pressable
          style={[styles.topUpBtn, topUpSubmitting && topUpCustomer?.id === item.id && styles.btnDisabled]}
          disabled={topUpSubmitting && topUpCustomer?.id === item.id}
          onPress={() => openTopUp(item)}
        >
          <Text style={styles.topUpBtnText}>Nạp tiền</Text>
        </Pressable>
      </View>
    )
  }

  const fixedHeader = (
    <View style={styles.fixedTop}>
      {/* <View style={styles.kpiRow}>
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
      </View> */}

      <View style={styles.searchWrap}>
        <Input
          icon={{ iconName: Search, iconDirection: 'left' }}
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

  const historyWalletData = historyWallet ?? historyCustomer?.getWalletResponse ?? null
  const txList = historyWalletData?.customerTransactions ?? []

  return (
    <View style={styles.safe}>
      {fixedHeader}

      <View style={styles.listPane}>
        {loading && !refreshing ? (
          Array.from({ length: 4 }).map((_, index) => (
            <CustomerWalletItemSkeleton key={index} />
          ))
        ) : (
          <FlatList
            style={styles.list}
            data={filtered}
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
            {totalItems} khách · Trang {currentPage}/{totalPages}
          </Text>
          <View style={styles.pager}>
            <Pressable
              style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]}
              disabled={currentPage <= 1 || loading}
              onPress={async () => {
                if (currentPage > 1) {
                  setLoading(true)
                  try {
                    await loadPage(currentPage - 1, debouncedSearch)
                  } catch (e) {
                    Toast.show({
                      type: 'error',
                      text1: typeof e === 'string' ? e : 'Không thể tải trang trước.'
                    })
                  } finally {
                    setLoading(false)
                  }
                }
              }}
            >
              <ChevronLeft size={18} color={currentPage <= 1 ? '#94a3b8' : '#0f172a'} strokeWidth={2.2} />
              <Text style={[styles.pageBtnText, currentPage <= 1 && styles.pageBtnTextDisabled]}>Trước</Text>
            </Pressable>
            <Pressable
              style={[styles.pageBtn, currentPage >= totalPages && styles.pageBtnDisabled]}
              disabled={currentPage >= totalPages || loading}
              onPress={async () => {
                if (currentPage < totalPages) {
                  setLoading(true)
                  try {
                    await loadPage(currentPage + 1, debouncedSearch)
                  } catch (e) {
                    Toast.show({
                      type: 'error',
                      text1: typeof e === 'string' ? e : 'Không thể tải trang sau.'
                    })
                  } finally {
                    setLoading(false)
                  }
                }
              }}
            >
              <Text style={[styles.pageBtnText, currentPage >= totalPages && styles.pageBtnTextDisabled]}>Sau</Text>
              <ChevronRight size={18} color={currentPage >= totalPages ? '#94a3b8' : '#0f172a'} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>
      ) : null}

      <Modal
        visible={!!topUpCustomer}
        animationType="fade"
        transparent
        onRequestClose={closeTopUp}
      >
        <Pressable style={styles.topUpOverlay} onPress={closeTopUp}>
          <View style={styles.topUpCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.topUpTitle}>Nạp tiền — {topUpCustomer?.customerName ?? ''}</Text>
            <Text style={styles.topUpHint}>
              Xác nhận khách trả tiền mặt. Số tiền sẽ được ghi nhận vào ví khách hàng.
            </Text>
            <Text style={styles.topUpLabel}>Số tiền (VNĐ)</Text>
            <TextInput
              style={styles.topUpInput}
              placeholder="VD: 500000"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              value={topUpAmount}
              onChangeText={(v) => setTopUpAmount(v.replace(/[^\d]/g, ''))}
              editable={!topUpSubmitting}
            />
            <View style={styles.topUpActions}>
              <Pressable
                style={[styles.topUpCancel, topUpSubmitting && styles.btnDisabled]}
                disabled={topUpSubmitting}
                onPress={closeTopUp}
              >
                <Text style={styles.topUpCancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.topUpConfirm, topUpSubmitting && styles.btnDisabled]}
                disabled={topUpSubmitting}
                onPress={() => void handleTopUpSubmit()}
              >
                <Text style={styles.topUpConfirmText}>
                  {topUpSubmitting ? 'Chờ...' : 'Xác nhận'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={!!historyCustomer} animationType="slide" transparent={false} onRequestClose={closeTransactionHistory}>
        <SafeAreaView style={styles.modalSafe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              Lịch sử giao dịch — {historyCustomer?.customerName ?? ''}
            </Text>
            <Pressable hitSlop={12} onPress={closeTransactionHistory} style={styles.modalCloseBtn}>
              <X size={18} color="#003366" strokeWidth={2.2} />
            </Pressable>
          </View>
          {historyCustomer && historyWalletData ? (
            <View style={styles.histSummary}>
              <View style={styles.histSummaryCol}>
                <Text style={styles.histSummaryLabel}>Ví tiền</Text>
                <Text style={styles.histSummaryValWallet}>
                  {formatWalletMoney(historyWalletData.amount)} đ
                </Text>
              </View>
              <View style={styles.histSummaryCol}>
                <Text style={styles.histSummaryLabel}>Tổng nợ</Text>
                <Text style={styles.histSummaryValDebt}>
                  {formatWalletMoney(historyWalletData.totalDebt)} đ
                </Text>
              </View>
            </View>
          ) : null}
          {historyLoading ? (
            <View style={styles.centerPad}>
              <ActivityIndicator size="large" />
              <Text style={styles.hint}>Đang tải lịch sử…</Text>
            </View>
          ) : historyError ? (
            <Text style={styles.emptyModal}>{historyError}</Text>
          ) : txList.length === 0 ? (
            <Text style={styles.emptyModal}>Chưa có giao dịch.</Text>
          ) : (
            <FlatList
              data={txList}
              keyExtractor={(t, i) => t.id || `tx-${i}`}
                renderItem={({ item }) => (
                <TransactionItem item={item} />
              )}
              contentContainerStyle={styles.txListContent}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
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
    gap: 10,
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 12
  },
  searchInput: { height: 50 },
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
  topUpBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac'
  },
  topUpBtnText: { color: '#166534', fontWeight: '700', fontSize: 15 },
  topUpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20
  },
  topUpCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  topUpTitle: { fontSize: 17, fontWeight: '800', color: '#003366', marginBottom: 8 },
  topUpHint: { fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 18 },
  topUpLabel: { fontSize: 14, fontWeight: '600', color: '#003366', marginBottom: 6 },
  topUpInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 16
  },
  topUpActions: { flexDirection: 'row', gap: 10 },
  topUpCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  topUpCancelText: { fontWeight: '700', color: '#64748b' },
  topUpConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#16a34a'
  },
  topUpConfirmText: { fontWeight: '700', color: '#fff' },
  btnDisabled: { opacity: 0.6 },
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
    gap: 8,
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
