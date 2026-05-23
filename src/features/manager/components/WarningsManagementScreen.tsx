import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { AlertTriangle, Check, Clock, X } from 'lucide-react-native'
import { WarningApi } from '../api/warning-api'
import type { ManagerWarningDetailResponse, ManagerWarningItem } from '../types/warning-type'
import { warningSeverityFromType, warningTypeLabelVi } from '../utils/warning-type-helpers'
import ManagerWarningItemSkeleton from './ui/ManagerWarningItemSkeleton'

const PAGE_SIZE = 9
const SEVERITY_FETCH_PAGE_SIZE = 120

type WarningListFilter = 'all' | 'unreviewed' | 'reviewed' | 'high' | 'medium'

function reviewFilterToParam(f: WarningListFilter): boolean | undefined {
  if (f === 'all' || f === 'high' || f === 'medium') return undefined
  if (f === 'unreviewed') return false
  return true
}

function formatWarningDateTime(raw: string): string {
  if (!raw) return '—'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleString('vi-VN')
}

function severityBorderColor(warningType: string | number): string {
  return warningSeverityFromType(warningType) === 'high' ? '#FB2C36' : '#FF9800'
}

export default function WarningsManagementScreen() {
  const [reviewFilter, setReviewFilter] = useState<WarningListFilter>('all')
  const [items, setItems] = useState<ManagerWarningItem[]>([])
  const [meta, setMeta] = useState({ total_pages: 1, current_page: 1 })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [listSyncing, setListSyncing] = useState(false)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState<ManagerWarningDetailResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const fetchPage = useCallback(
    async (p: number, reset: boolean) => {
      if (reviewFilter === 'high' || reviewFilter === 'medium') {
        const res = await WarningApi.getWarnings(1, SEVERITY_FETCH_PAGE_SIZE, undefined)
        const nextItems = (res.items ?? []).filter(
          (it) => warningSeverityFromType(it.warningType) === reviewFilter
        )
        setMeta({ total_pages: 1, current_page: 1 })
        setItems(nextItems)
        return
      }
      const isReviewed = reviewFilterToParam(reviewFilter)
      const res = await WarningApi.getWarnings(p, PAGE_SIZE, isReviewed)
      const nextItems = res.items ?? []
      const m = res.meta ?? { total_pages: 1, current_page: p, total_items: 0, page_size: PAGE_SIZE }
      setMeta({ total_pages: m.total_pages ?? 1, current_page: m.current_page ?? p })
      setItems((prev) => (reset ? nextItems : [...prev, ...nextItems]))
    },
    [reviewFilter]
  )

  const reloadFirstPageSilent = useCallback(async () => {
    setListSyncing(true)
    setListError(null)
    try {
      await fetchPage(1, true)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Không làm mới danh sách.'
      setListError(msg)
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setListSyncing(false)
    }
  }, [fetchPage])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setListError(null)
    setItems([])
    ;(async () => {
      try {
        await fetchPage(1, true)
      } catch (e) {
        if (cancelled) return
        const msg = typeof e === 'string' ? e : 'Không thể tải danh sách cảnh báo. Vui lòng thử lại.'
        setListError(msg)
        Toast.show({ type: 'error', text1: msg })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reviewFilter, fetchPage])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setListError(null)
    try {
      await fetchPage(1, true)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Làm mới thất bại.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setRefreshing(false)
    }
  }, [fetchPage])

  const onLoadMore = useCallback(async () => {
    if (reviewFilter === 'high' || reviewFilter === 'medium') return
    if (loading || loadingMore || refreshing || listSyncing) return
    if (meta.current_page >= meta.total_pages) return
    const next = meta.current_page + 1
    setLoadingMore(true)
    try {
      await fetchPage(next, false)
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Không tải thêm được.'
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setLoadingMore(false)
    }
  }, [reviewFilter, loading, loadingMore, refreshing, listSyncing, meta, fetchPage])

  const closeDetail = useCallback(() => {
    setDetailOpen(false)
    setDetail(null)
    setDetailError(null)
    setDetailLoading(false)
    void reloadFirstPageSilent()
  }, [reloadFirstPageSilent])

  const openDetail = useCallback(
    async (row: ManagerWarningItem) => {
      if (!row.id) {
        Toast.show({ type: 'error', text1: 'Thiếu mã cảnh báo để xem chi tiết.' })
        return
      }
      setDetailOpen(true)
      setDetail({ ...row, description: row.reason || row.preview })
      setDetailError(null)
      setDetailLoading(true)
      try {
        const d = await WarningApi.getWarningDetail(row.id)
        setDetail({ ...d, isReviewed: true })
        setItems((prev) => prev.map((it) => (it.id === row.id ? { ...it, isReviewed: true } : it)))
        void reloadFirstPageSilent()
      } catch (e) {
        const msg = typeof e === 'string' ? e : 'Không tải nội dung cảnh báo. Vui lòng thử lại.'
        setDetailError(msg)
        Toast.show({ type: 'error', text1: msg })
      } finally {
        setDetailLoading(false)
      }
    },
    [reloadFirstPageSilent]
  )

  const filterSpecs = [
    { key: 'all' as const, label: 'Tất cả', onBg: '#dbeafe', onBorder: '#93c5fd', onText: '#1e40af' },
    { key: 'unreviewed' as const, label: 'Chưa xem', onBg: '#ffe4e6', onBorder: '#fda4af', onText: '#be123c' },
    { key: 'reviewed' as const, label: 'Đã xem', onBg: '#dcfce7', onBorder: '#86efac', onText: '#166534' },
    { key: 'high' as const, label: 'Nghiêm trọng', onBg: '#fee2e2', onBorder: '#fca5a5', onText: '#b91c1c' },
    { key: 'medium' as const, label: 'Cảnh báo', onBg: '#ffedd5', onBorder: '#fdba74', onText: '#c2410c' }
  ]

  const renderRow = ({ item }: { item: ManagerWarningItem }) => {
    const isHigh = warningSeverityFromType(item.warningType) === 'high'
    const typeLabel = warningTypeLabelVi(item.warningType)
    const reasonText = item.reason || item.preview || '—'
    return (
      <Pressable
        style={[styles.card, { borderTopColor: severityBorderColor(item.warningType) }]}
        onPress={() => openDetail(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <AlertTriangle size={16} color={isHigh ? '#dc2626' : '#d97706'} strokeWidth={2.2} />
            <Text style={styles.cardTypeTitle} numberOfLines={1}>
              {typeLabel}
            </Text>
          </View>
          <View style={[styles.sevBadge, isHigh ? styles.sevBadgeHigh : styles.sevBadgeMedium]}>
            <Text style={styles.sevBadgeText}>{isHigh ? 'Nghiêm trọng' : 'Cảnh báo'}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>NHÂN VIÊN</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {item.staffName}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>KHÁCH HÀNG</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {item.customerName}
            </Text>
          </View>
        </View>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonText} numberOfLines={4}>
            <Text style={styles.reasonBold}>Chi tiết: </Text>
            {reasonText}
          </Text>
        </View>

        <View style={styles.cardFooterRow}>
          <View style={styles.timeTag}>
            <Clock size={12} color="#fff" strokeWidth={2.2} />
            <Text style={styles.timeTagText}>{formatWarningDateTime(item.createdAt)}</Text>
          </View>
          <View style={[styles.readPill, item.isReviewed ? styles.readPillOn : styles.readPillOff]}>
            {item.isReviewed ? <Check size={12} color="#166534" strokeWidth={2.5} /> : null}
            <Text style={[styles.readPillText, item.isReviewed ? styles.readPillTextOn : styles.readPillTextOff]}>
              {item.isReviewed ? 'Đã xem' : 'Chưa xem'}
            </Text>
          </View>
        </View>
      </Pressable>
    )
  }

  return (
    <View style={styles.safe}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {filterSpecs.map((x) => {
            const on = reviewFilter === x.key
            return (
              <Pressable
                key={x.key}
                onPress={() => setReviewFilter(x.key)}
                style={[
                  styles.filterChip,
                  on && { backgroundColor: x.onBg, borderColor: x.onBorder }
                ]}
              >
                <Text style={[styles.filterChipText, on && { color: x.onText, fontWeight: '700' }]}>{x.label}</Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {listError ? (
        <View style={styles.errBox}>
          <Text style={styles.errText}>{listError}</Text>
          <Pressable style={styles.retry} onPress={onRefresh}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : null}

      {loading && items.length === 0 ? (
        Array.from({ length: 4 }).map((_, i) => (
          <ManagerWarningItemSkeleton key={i}/>
        ) )
      ) : (
        <FlatList
          style={styles.listFlex}
          data={items}
          keyExtractor={(it) => it.id || it.conversationId}
          renderItem={renderRow}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            listSyncing ? (
              <View style={styles.syncBar}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.syncText}>Đang cập nhật danh sách…</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={<Text style={styles.empty}>Không có cảnh báo.</Text>}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            meta.current_page < meta.total_pages ? (
              <View style={{ paddingVertical: 16 }}>{loadingMore ? <ActivityIndicator /> : null}</View>
            ) : null
          }
        />
      )}

      <Modal visible={detailOpen} animationType="slide" transparent onRequestClose={closeDetail}>
        <Pressable style={styles.modalBackdrop} onPress={closeDetail}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nội dung cảnh báo</Text>
              <Pressable onPress={closeDetail} hitSlop={12} style={styles.modalCloseBtn}>
                <X size={20} color="#64748b" strokeWidth={2} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {detailLoading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
              {detailError ? <Text style={styles.errText}>{detailError}</Text> : null}
              {detail && !detailLoading ? (
                <View style={styles.modalContent}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxLabel}>LOẠI CẢNH BÁO</Text>
                    <Text style={styles.infoBoxValue}>{warningTypeLabelVi(detail.warningType)}</Text>
                  </View>

                  <View style={styles.metaGrid}>
                    <View style={[styles.infoBox, styles.infoBoxHalf]}>
                      <Text style={styles.infoBoxLabel}>NHÂN VIÊN</Text>
                      <Text style={styles.infoBoxValue}>{detail.staffName ?? '—'}</Text>
                    </View>
                    <View style={[styles.infoBox, styles.infoBoxHalf]}>
                      <Text style={styles.infoBoxLabel}>KHÁCH HÀNG</Text>
                      <Text style={styles.infoBoxValue}>{detail.customerName ?? '—'}</Text>
                    </View>
                  </View>

                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxLabel}>THỜI GIAN TẠO</Text>
                    <Text style={styles.infoBoxValue}>{formatWarningDateTime(detail.createdAt)}</Text>
                  </View>

                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxLabel}>TRẠNG THÁI</Text>
                    <View style={[styles.readPill, detail.isReviewed ? styles.readPillOn : styles.readPillOff, styles.readPillInline]}>
                      <Text style={[styles.readPillText, detail.isReviewed ? styles.readPillTextOn : styles.readPillTextOff]}>
                        {detail.isReviewed ? 'Đã xem' : 'Chưa xem'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reasonBoxModal}>
                    <Text style={styles.reasonBoxModalLabel}>NỘI DUNG CẢNH BÁO</Text>
                    <Text style={styles.reasonBoxModalText}>
                      {detail.reason || detail.description || detail.preview || '—'}
                    </Text>
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 16, paddingBottom: 4 },
  screenTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12
  },
  filterChip: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5
  },
  filterChipText: { fontSize: 14, fontWeight: '600', color: '#64748b', textAlign: 'center' },
  listFlex: { flex: 1 },
  syncBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4
  },
  syncText: { fontSize: 13, color: '#475569', marginLeft: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderTopWidth: 4,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  cardTypeTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: '#003366' },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sevBadgeHigh: { backgroundColor: '#dc2626' },
  sevBadgeMedium: { backgroundColor: '#ea580c' },
  sevBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  metaGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  metaCol: { flex: 1, minWidth: 0 },
  metaLabel: { fontSize: 10, fontWeight: '600', color: '#6b7280', letterSpacing: 0.3 },
  metaValue: { fontSize: 13, fontWeight: '600', color: '#003366', marginTop: 2 },
  reasonBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 8,
    padding: 10,
    minHeight: 64,
    marginBottom: 12
  },
  reasonText: { fontSize: 12, color: '#374151', lineHeight: 18 },
  reasonBold: { fontWeight: '800' },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f97316',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: '58%'
  },
  timeTagText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  readPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  readPillOn: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#bbf7d0' },
  readPillOff: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca' },
  readPillText: { fontSize: 10, fontWeight: '700' },
  readPillTextOn: { color: '#166534' },
  readPillTextOff: { color: '#991b1b' },
  readPillInline: { alignSelf: 'flex-start', marginTop: 6 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 32, fontSize: 15 },
  errBox: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  errText: { color: '#991b1b', fontSize: 14 },
  retry: { marginTop: 8, alignSelf: 'flex-start' },
  retryText: { color: '#2563eb', fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '88%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#003366', flex: 1 },
  modalCloseBtn: { padding: 4 },
  modalContent: { gap: 12, paddingBottom: 8 },
  infoBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f9fafb'
  },
  infoBoxHalf: { flex: 1, minWidth: 0 },
  infoBoxLabel: { fontSize: 10, fontWeight: '600', color: '#6b7280', letterSpacing: 0.4 },
  infoBoxValue: { fontSize: 14, fontWeight: '600', color: '#003366', marginTop: 4 },
  reasonBoxModal: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 12
  },
  reasonBoxModalLabel: { fontSize: 10, fontWeight: '700', color: '#b91c1c', letterSpacing: 0.4 },
  reasonBoxModalText: { fontSize: 14, color: '#991b1b', marginTop: 6, lineHeight: 20 }
})
