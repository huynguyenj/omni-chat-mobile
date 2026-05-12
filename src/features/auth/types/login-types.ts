export type LoginResponseType = {
  accessToken: string
  refreshToken: string
  role: string
  accountId: string
  staffId: string
  avatarUrl: string | null
  staffName: string
}

export type RefreshTokenType = {
  accessToken: string
}