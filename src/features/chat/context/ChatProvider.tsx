import { createContext, useState, type PropsWithChildren } from 'react'
import { listTabPlatforms } from '../const/platforms'

type SelectionMessageContextProps = {
  conversationId: string | null
  providerName: string
  handleChoose: (conversationId: string) => void
  handleChooseProviderName: (providerName: string) => void
}

const SelectionMessageContext = createContext<SelectionMessageContextProps | undefined>(undefined)

export function ChatProvider({ children }: PropsWithChildren) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [providerName, setProviderName] = useState(listTabPlatforms[0])
  const handleChoose = (conversationId: string) => {
    setConversationId(conversationId)
  }
  const handleChooseProviderName = (providerName: string) => {
    setConversationId(null)
    setProviderName(providerName)
  }

  return (
    <SelectionMessageContext value={{ conversationId, handleChoose, providerName, handleChooseProviderName }}>
      {children}
    </SelectionMessageContext>
  )
}

export default SelectionMessageContext