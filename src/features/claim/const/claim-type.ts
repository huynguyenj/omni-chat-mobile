import { ClaimType } from "../types/claim-type"

export const CLAIM_TYPE: Record<string, string> = {
  QUITJOB: 'Nghỉ việc',
  ABSENT: 'Vắng mặt',
  ONLEAVE: 'Nghỉ phép',
  CHANGETASK: 'Đổi task'
}

export const CLAIM_STATUS: Record<string, string> = {
  Pending: 'Đang chờ duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Từ chối'
}

export const tagClaimColor: Record<ClaimType['status'], 'default' | 'success' | 'danger'> = {
      Pending: 'default',
      Approved: 'success',
      Rejected: 'default'
}