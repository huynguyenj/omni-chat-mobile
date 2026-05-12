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
import { WarningApi } from '../api/warning-api'
import type { ManagerWarningDetailResponse, ManagerWarningItem } from '../types/warning-type'
import { formatDateTime } from '../utils/claimsNormalize'
import { severityTag, warningSeverity } from '../utils/warning-severity'

const PAGE_SIZE = 10

type ReviewFilter = 'all' | 'unreviewed' | 'reviewed'

function reviewFilterToParam(f: ReviewFilter): boolean | undefined {
  if (f === 'all') return undefined
  if (f === 'unreviewed') return false
  return true
}

export default function WarningsManagementScreen() {
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all')
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
        const msg = typeof e === 'string' ? e : 'Không tải được danh sách cảnh báo.'
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
  }, [loading, loadingMore, refreshing, listSyncing, meta, fetchPage])

  const closeDetail = useCallback(() => {
    setDetailOpen(false)
    setDetail(null)
    setDetailError(null)
    setDetailLoading(false)
    void reloadFirstPageSilent()
  }, [reloadFirstPageSilent])

  const openDetail = useCallback(async (row: ManagerWarningItem) => {
    if (!row.id) {
      Toast.show({ type: 'error', text1: 'Thiếu mã cảnh báo để xem chi tiết.' })
      return
    }
    setDetailOpen(true)
    setDetail({ ...row, description: row.preview !== '—' ? row.preview : undefined })
    setDetailError(null)
    setDetailLoading(true)
    try {
      const d = await WarningApi.getWarningDetail(row.id)
      setDetail(d)
      void reloadFirstPageSilent()
    } catch (e) {
      const msg = typeof e === 'string' ? e : 'Không tải chi tiết.'
      setDetailError(msg)
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setDetailLoading(false)
    }
  }, [reloadFirstPageSilent])

  const renderRow = ({ item }: { item: ManagerWarningItem }) => {
    const sev = warningSeverity(item)
    const tag = severityTag(sev)
    return (
      <Pressable style={styles.card} onPress={() => openDetail(item)}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.badge, { backgroundColor: tag.bg }]}>
            <Text style={[styles.badgeText, { color: tag.color }]}>{tag.label}</Text>
          </View>
        </View>
        <Text style={styles.type}>{item.warningType || '—'}</Text>
        <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
        <Text style={styles.preview} numberOfLines={2}>
          {item.preview}
        </Text>
        <View style={[styles.reviewedPill, item.isReviewed ? styles.reviewedOn : styles.reviewedOff]}>
          <Text style={styles.reviewedText}>{item.isReviewed ? 'Đã xem' : 'Chưa xem'}</Text>
        </View>
      </Pressable>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Cảnh báo</Text>
      </View>

      <View style={styles.filterRow}>
        {(
          [
            { key: 'all' as const, label: 'Tất cả' },
            { key: 'unreviewed' as const, label: 'Chưa xem' },
            { key: 'reviewed' as const, label: 'Đã xem' }
          ] as const
        ).map((x) => (
          <Pressable
            key={x.key}
            onPress={() => setReviewFilter(x.key)}
            style={[styles.filterChip, reviewFilter === x.key && styles.filterChipOn]}
          >
            <Text style={[styles.filterChipText, reviewFilter === x.key && styles.filterChipTextOn]}>{x.label}</Text>
          </Pressable>
        ))}
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
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <FlatList
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
            <ScrollView>
              {detailLoading ? <ActivityIndicator style={{ marginBottom: 12 }} /> : null}
              <Text style={styles.modalTitle}>Chi tiết cảnh báo</Text>
              {detailError ? <Text style={styles.errText}>{detailError}</Text> : null}
              {detail ? (
                  <>
                    <View style={styles.modalBadges}>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: severityTag(warningSeverity(detail)).bg }
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: severityTag(warningSeverity(detail)).color }
                          ]}
                        >
                          {severityTag(warningSeverity(detail)).label}
                        </Text>
                      </View>
                      <View style={[styles.reviewedPill, detail.isReviewed ? styles.reviewedOn : styles.reviewedOff]}>
                        <Text style={styles.reviewedText}>{detail.isReviewed ? 'Đã xem' : 'Chưa xem'}</Text>
                      </View>
                    </View>
                    <Text style={styles.modalLabel}>Loại</Text>
                    <Text style={styles.modalValue}>{detail.warningType || '—'}</Text>
                    <Text style={styles.modalLabel}>Thời gian</Text>
                    <Text style={styles.modalValue}>{formatDateTime(detail.createdAt)}</Text>
                    {detail.conversationId ? (
                      <>
                        <Text style={styles.modalLabel}>Hội thoại</Text>
                        <Text style={styles.modalValue}>{detail.conversationId}</Text>
                      </>
                    ) : null}
                    {detail.conversationTitle ? (
                      <>
                        <Text style={styles.modalLabel}>Tiêu đề hội thoại</Text>
                        <Text style={styles.modalValue}>{detail.conversationTitle}</Text>
                      </>
                    ) : null}
                    {detail.staffName ? (
                      <>
                        <Text style={styles.modalLabel}>Nhân viên</Text>
                        <Text style={styles.modalValue}>{detail.staffName}</Text>
                      </>
                    ) : null}
                    {detail.customerName ? (
                      <>
                        <Text style={styles.modalLabel}>Khách</Text>
                        <Text style={styles.modalValue}>{detail.customerName}</Text>
                      </>
                    ) : null}
                    <Text style={styles.modalLabel}>Tiêu đề</Text>
                    <Text style={styles.modalValue}>{detail.title}</Text>
                    <Text style={styles.modalLabel}>Nội dung</Text>
                    <Text style={styles.modalValue}>{detail.description ?? detail.preview}</Text>
                  </>
                ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  screenTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginTop: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  filterChipOn: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  filterChipTextOn: { color: '#fff' },
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
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#0f172a', marginRight: 8 },
  type: { fontSize: 13, color: '#475569' },
  date: { fontSize: 12, color: '#64748b', marginTop: 2 },
  preview: { fontSize: 14, color: '#334155', marginTop: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  reviewedPill: { alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  reviewedOn: { backgroundColor: '#dcfce7' },
  reviewedOff: { backgroundColor: '#f1f5f9' },
  reviewedText: { fontSize: 12, fontWeight: '600', color: '#334155' },
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
    padding: 20,
    maxHeight: '85%'
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  modalBadges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  modalLabel: { fontSize: 12, color: '#64748b', marginTop: 10 },
  modalValue: { fontSize: 15, color: '#0f172a' }
})
