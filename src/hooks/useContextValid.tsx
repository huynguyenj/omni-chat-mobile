import React, { useContext } from 'react'

export default function useContextValid<T>(context: React.Context<T | undefined>) {
  const value = useContext(context)
  if (!value) throw Error('Please wrap children with the context provider!')
  return value
}
