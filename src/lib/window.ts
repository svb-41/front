import { useEffect } from 'react'

export type Dimensions = { width: number; height: number }
export const dimensions = (): Dimensions => {
  const width = window.innerWidth
  const height = window.innerHeight
  return { width, height }
}

export type UseResize = (dimensions: Dimensions) => void
export const useResize = (callback: UseResize) => {
  useEffect(() => {
    const cb = () => callback(dimensions())
    window.addEventListener('resize', cb)
    return () => window.removeEventListener('resize', cb)
  }, [callback])
}
