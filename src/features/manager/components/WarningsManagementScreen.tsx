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
import {
  Check,
  Clock,
  List,
  Star,
  Tag,
  User
} from 'lucide-react-native'
import { WarningApi } from '../api/warning-api'
import type { ManagerWarningDetailResponse, ManagerWarningItem } from '../types/warning-type'
import { formatDateTime } from '../utils/claimsNormalize'
import { severityTag, severityTheme, warningSeverity } from '../utils/warning-severity'

const PAGE_SIZE = 10

type ReviewFilter = 'all' | 'unreviewed' | 'reviewed'

function reviewFilterToParam(f: ReviewFilter): boolean | undefined {
  if (f === 'all') return undefined
  if (f === 'unreviewed') return false
  return true
}

type LucideIconProps = { size?: number; color?: string; strokeWidth?: number }

function DetailIconRow({
  Icon,
  label,
  value
}: {
  Icon: React.ComponentType<LucideIconProps>
  label: string
  value: string
}) {
  return (
    <View style={styles.detailIconRow}>
      <View style={styles.iconBubble}>
        <Icon size={14} color="#475569" strokeWidth={2} />
      </View>
      <View style={styles.detailIconTextWrap}>
        <Text style={styles.detailIconLabel}>{label}</Text>
        <Text style={styles.detailIconValue}>{value}</Text>
      </View>
    </View>
  )
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

  const openDetail = useCallback(
    async (row: ManagerWarningItem) => {
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
    },
    [reloadFirstPageSilent]
  )

  const filterSpecs = [
    { key: 'all' as const, label: 'Tất cả', onBg: '#dbeafe', onBorder: '#93c5fd', onText: '#1e40af' },
    { key: 'unreviewed' as const, label: 'Chưa xem', onBg: '#ffe4e6', onBorder: '#fda4af', onText: '#be123c' },
    { key: 'reviewed' as const, label: 'Đã xem', onBg: '#dcfce7', onBorder: '#86efac', onText: '#166534' }
  ]

  const renderRow = ({ item }: { item: ManagerWarningItem }) => {
    const sev = warningSeverity(item)
    const theme = severityTheme(sev)
    const tag = severityTag(sev)
    return (
      <Pressable
        style={[styles.card, { borderColor: theme.borderTone }]}
        onPress={() => openDetail(item)}
      >
        <View style={[styles.cardHead, { backgroundColor: theme.headerTint }]}>
          <Text style={[styles.cardTitle, { color: theme.titleColor }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[styles.sevBadge, { backgroundColor: tag.bg }]}>
            <Text style={styles.sevBadgeText}>{tag.label}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardLine}>
            <Tag size={15} color="#64748b" strokeWidth={2} />
            <Text style={styles.cardLineText} numberOfLines={1}>
              {item.warningType || '—'}
            </Text>
          </View>
          <View style={styles.cardLine}>
            <Clock size={15} color="#64748b" strokeWidth={2} />
            <Text style={styles.cardLineText}>{formatDateTime(item.createdAt)}</Text>
          </View>
          <View style={styles.cardLine}>
            <List size={15} color="#64748b" strokeWidth={2} />
            <Text style={styles.cardPreview} numberOfLines={3}>
              {item.preview}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={[styles.readPill, item.isReviewed ? styles.readPillOn : styles.readPillOff]}>
            {item.isReviewed ? <Check size={14} color="#15803d" strokeWidth={2.5} /> : null}
            <Text style={[styles.readPillText, item.isReviewed ? styles.readPillTextOn : styles.readPillTextOff]}>
              {item.isReviewed ? 'Đã xem' : 'Chưa xem'}
            </Text>
          </View>
        </View>
      </Pressable>
    )
  }

  const extraThresholdLabel = (d: ManagerWarningDetailResponse): string | null => {
    const ex = d.extra
    if (!ex || typeof ex !== 'object') return null
    const o = ex as Record<string, unknown>
    const keys = ['alertThresholdMinutes', 'thresholdMinutes', 'responseThresholdMinutes', 'threshold']
    for (const k of keys) {
      const v = o[k]
      if (v != null && v !== '') return `${v} phút`
    }
    return null
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Cảnh báo</Text>
      </View>

      <View style={styles.filterRow}>
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
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalScreenTitle}>Chi tiết cảnh báo</Text>
              {detailLoading ? <ActivityIndicator style={{ marginBottom: 12 }} /> : null}
              {detailError ? <Text style={styles.errText}>{detailError}</Text> : null}
              {detail ? (
                <>
                  {(() => {
                    const sev = warningSeverity(detail)
                    const theme = severityTheme(sev)
                    const tag = severityTag(sev)
                    const summary = (detail.description ?? detail.preview ?? '—').trim()
                    const threshold = extraThresholdLabel(detail)
                    return (
                      <>
                        <View
                          style={[
                            styles.modalHead,
                            { backgroundColor: theme.headerTint, borderColor: theme.borderTone }
                          ]}
                        >
                          <View style={styles.modalHeadTop}>
                            <Text style={[styles.modalHeadTitle, { color: theme.titleColor }]}>{detail.title}</Text>
                            <View style={[styles.sevBadge, { backgroundColor: tag.bg }]}>
                              <Text style={styles.sevBadgeText}>{tag.label}</Text>
                            </View>
                          </View>
                          {detail.staffName ? (
                            <View style={styles.modalHeadMeta}>
                              <User size={15} color="#64748b" strokeWidth={2} />
                              <Text style={styles.modalHeadMetaText}>Tên NV: {detail.staffName}</Text>
                            </View>
                          ) : null}
                        </View>

                        <View style={styles.modalBody}>
                          <View style={styles.modalTagRow}>
                            <Tag size={15} color="#64748b" strokeWidth={2} />
                            <Text style={styles.modalTagText}>{detail.warningType || '—'}</Text>
                          </View>

                          <View style={styles.modalSummary}>
                            <Clock size={22} color="#64748b" strokeWidth={2} />
                            <Text style={styles.modalSummaryText}>{summary}</Text>
                          </View>

                          <View style={styles.modalDivider} />

                          <View style={styles.modalGrid}>
                            <View style={styles.modalGridCol}>
                              <DetailIconRow Icon={Tag} label="Loại cảnh báo" value={detail.warningType || '—'} />
                            </View>
                            <View style={styles.modalGridCol}>
                              <DetailIconRow
                                Icon={User}
                                label="Nhân viên"
                                value={detail.staffName ?? '—'}
                              />
                            </View>
                          </View>

                          <View style={styles.modalGrid}>
                            <View style={styles.modalGridCol}>
                              <DetailIconRow
                                Icon={Star}
                                label="Khách hàng"
                                value={detail.customerName ?? '—'}
                              />
                            </View>
                            <View style={styles.modalGridCol}>
                              <DetailIconRow
                                Icon={Clock}
                                label="Ngưỡng cảnh báo"
                                value={threshold ?? '—'}
                              />
                            </View>
                          </View>

                          <DetailIconRow Icon={List} label="Nội dung chi tiết" value={summary} />

                          {detail.conversationId ? (
                            <DetailIconRow Icon={List} label="Hội thoại" value={detail.conversationId} />
                          ) : null}
                          {detail.conversationTitle ? (
                            <DetailIconRow Icon={Tag} label="Tiêu đề hội thoại" value={detail.conversationTitle} />
                          ) : null}

                          <View style={styles.modalFooterBadge}>
                            <View style={[styles.readPill, detail.isReviewed ? styles.readPillOn : styles.readPillOff]}>
                              {detail.isReviewed ? (
                                <Check size={14} color="#15803d" strokeWidth={2.5} />
                              ) : null}
                              <Text
                                style={[
                                  styles.readPillText,
                                  detail.isReviewed ? styles.readPillTextOn : styles.readPillTextOff
                                ]}
                              >
                                {detail.isReviewed ? 'Đã xem' : 'Chưa xem'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </>
                    )
                  })()}
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
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#64748b', textAlign: 'center' },
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
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', minWidth: 0 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  sevBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  cardBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff'
  },
  cardLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6 },
  cardLineText: { flex: 1, fontSize: 13, color: '#334155', paddingTop: 1 },
  cardPreview: { flex: 1, fontSize: 14, color: '#334155', lineHeight: 20, paddingTop: 1 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 4,
    backgroundColor: '#fff'
  },
  readPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  readPillOn: { backgroundColor: '#ccfbf1' },
  readPillOff: { backgroundColor: '#ffe4e6' },
  readPillText: { fontSize: 12, fontWeight: '700' },
  readPillTextOn: { color: '#0f766e' },
  readPillTextOff: { color: '#be123c' },
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
  modalScreenTitle: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8, textAlign: 'center' },
  modalHead: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1
  },
  modalHeadTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  modalHeadTitle: { flex: 1, fontSize: 17, fontWeight: '800', minWidth: 0 },
  modalHeadMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  modalHeadMetaText: { fontSize: 13, color: '#475569', flex: 1 },
  modalBody: { paddingBottom: 8 },
  modalTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  modalTagText: { fontSize: 14, fontWeight: '600', color: '#334155', flex: 1 },
  modalSummary: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12
  },
  modalSummaryText: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20
  },
  modalDivider: { height: 1, backgroundColor: '#e2e8f0', marginBottom: 12 },
  modalGrid: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  modalGridCol: { flex: 1, minWidth: 0 },
  detailIconRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  iconBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailIconTextWrap: { flex: 1, minWidth: 0 },
  detailIconLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 2 },
  detailIconValue: { fontSize: 13, color: '#0f172a', lineHeight: 18 },
  modalFooterBadge: { alignItems: 'flex-end', marginTop: 8 }
})
