import React, { createContext, PropsWithChildren, useState } from 'react'

type RefreshProviderProps = {
   isRefresh: boolean
   handleRefresh: () => void
}

const RefreshContext = createContext<RefreshProviderProps | undefined>(undefined)

export function RefreshProvider({ children }: PropsWithChildren) {
  const [isRefresh, setIsRefresh] = useState(false)
  const handleRefresh = () => {
      setIsRefresh(prev => !prev)
  }
  return (
    <RefreshContext value={{ handleRefresh, isRefresh }}>
      {children}
    </RefreshContext>
  )
}

export default RefreshContext
