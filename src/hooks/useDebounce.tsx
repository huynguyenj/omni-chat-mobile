import { useEffect, useRef } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useDebounce<T extends (...args: any[]) => void>(func: T, delay: number) {

  const timeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debounce = (...args: Parameters<T>) => {
    if (timeRef.current) clearTimeout(timeRef.current)

    timeRef.current = setTimeout(() => {
      return func(...args as Parameters<T>)
    }, delay)
  }
  useEffect(() => {
    return () => {
      if (timeRef.current) clearTimeout(timeRef.current)
    }
  }, [])
  return debounce
}