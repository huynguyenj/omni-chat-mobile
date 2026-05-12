import { apiPrivate, apiPublic } from '@/configs/axios.config'
import type { ManagerInvoiceItem, ManagerInvoiceListQuery, ManagerInvoiceListResponse } from '../types/manager-invoice-type'
import { assertManagerPublicSuccess, unwrapItemsMeta } from '../utils/managerPagedUnwrap'
import { normalizeInvoice } from '../utils/managerInvoicesNormalize'

const FETCH_ALL_PAGE_SIZE = 100

function resolveInvoicesGetPath() {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/invoices/get'
  return '/api/v1/invoices/get'
}

function resolveInvoiceExportPath(id: string) {
  const baseUrl = (apiPrivate.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return `/invoices/${encodeURIComponent(id)}/export`
  return `/api/v1/invoices/${encodeURIComponent(id)}/export`
}

function buildInvoiceListParams(query: ManagerInvoiceListQuery) {
  const pageNumber = Math.max(1, query.pageNumber ?? 1)
  const pageSize = Math.max(1, query.pageSize ?? FETCH_ALL_PAGE_SIZE)
  const sortBy = query.sortBy?.trim() || 'startedDate'
  const descending = query.descending !== false
  const params: Record<string, unknown> = {
    pageNumber,
    pageSize,
    sortBy,
    descending
  }
  if (query.invoiceId?.trim()) params.invoiceId = query.invoiceId.trim()
  if (query.status?.trim()) params.status = query.status.trim()
  return params
}

function tryParseJsonInvoiceExportError(buffer: ArrayBuffer): string | null {
  const u8 = new Uint8Array(buffer)
  let i = 0
  while (i < u8.length && (u8[i] === 32 || u8[i] === 9 || u8[i] === 10 || u8[i] === 13)) i++
  if (i >= u8.length || u8[i] !== 123) return null
  const txt = new TextDecoder('utf-8').decode(buffer)
  try {
    const j = JSON.parse(txt) as Record<string, unknown>
    const msg = j.message ?? j.reason ?? j.error ?? j.title
    if (typeof msg === 'string' && msg.trim()) return msg.trim()
    return 'Xuất hóa đơn thất bại.'
  } catch {
    return null
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!)
  return globalThis.btoa(binary)
}

export const ManagerInvoiceApi = {
  getInvoices: async (query: ManagerInvoiceListQuery): Promise<ManagerInvoiceListResponse> => {
    const pageSize = Math.max(1, query.pageSize ?? FETCH_ALL_PAGE_SIZE)
    const params = buildInvoiceListParams(query)
    const raw: unknown = await apiPublic.get(resolveInvoicesGetPath(), { params })
    assertManagerPublicSuccess(raw)
    return unwrapItemsMeta(raw, pageSize, normalizeInvoice)
  },

  /**
   * Lặp theo trang API cho đến hết (pageSize 100, sortBy startedDate, descending true) — parity với web.
   */
  fetchAllInvoices: async (): Promise<ManagerInvoiceItem[]> => {
    let page = 1
    const merged: ManagerInvoiceItem[] = []
    while (true) {
      const res = await ManagerInvoiceApi.getInvoices({
        pageNumber: page,
        pageSize: FETCH_ALL_PAGE_SIZE,
        sortBy: 'startedDate',
        descending: true
      })
      merged.push(...res.items)
      const totalPages = Math.max(1, res.meta.total_pages ?? 1)
      if (page >= totalPages) break
      page += 1
    }
    return merged
  },

  /**
   * GET export — trả ArrayBuffer xlsx hoặc ném Error(message) nếu server trả JSON/HTML lỗi (giống ý tưởng web).
   */
  exportInvoiceExcelBuffer: async (invoiceId: string): Promise<ArrayBuffer> => {
    if (!invoiceId) throw new Error('Thiếu mã hóa đơn.')
    const raw: unknown = await apiPrivate.get(resolveInvoiceExportPath(invoiceId), {
      responseType: 'arraybuffer'
    })
    if (raw instanceof ArrayBuffer) {
      const err = tryParseJsonInvoiceExportError(raw)
      if (err) throw new Error(err)
      return raw
    }
    if (raw && typeof raw === 'object' && !(raw instanceof ArrayBuffer)) {
      const o = raw as Record<string, unknown>
      throw new Error(String(o.message ?? o.reason ?? o.error ?? 'Xuất hóa đơn thất bại.'))
    }
    throw new Error('Định dạng phản hồi xuất hóa đơn không hợp lệ.')
  },

  /** Base64 để ghi file qua expo-file-system */
  exportInvoiceExcelBase64: async (invoiceId: string): Promise<string> => {
    const buf = await ManagerInvoiceApi.exportInvoiceExcelBuffer(invoiceId)
    return arrayBufferToBase64(buf)
  }
}
