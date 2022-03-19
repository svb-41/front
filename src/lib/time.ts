import { useEffect } from 'react'

export const useInterval = (interval: number, callback: () => void) => {
  useEffect(() => {
    const counter = setInterval(() => callback(), interval)
    return () => clearInterval(counter)
  }, [callback, interval])
}
