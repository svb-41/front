import { FC, useState, useEffect, useRef } from 'react'
import { Column, Row } from '@/components/flex'

const usePosition = () => {
  const [position, setPosition] = useState({ bottom: 24, right: 24 })
  const popupRef = useRef<any>(null)
  useEffect(() => {
    const fun = (event: MouseEvent) => {
      if (popupRef.current) {
        const x_ = popupRef.current.x - event.clientX
        const y_ = popupRef.current.y - event.clientY
        const right = x_ + popupRef.current.initialPosition.right
        const bottom = y_ + popupRef.current.initialPosition.bottom
        setPosition({ bottom, right })
      }
    }
    document.addEventListener('mousemove', fun)
    return () => document.removeEventListener('mousemove', fun)
  }, [])
  const onMouseDown = (event: any) => {
    popupRef.current = {
      x: event.clientX,
      y: event.clientY,
      initialPosition: position,
    }
  }
  const onMouseUp = () => (popupRef.current = null)
  return { position, onMouseDown, onMouseUp }
}

export type Props = { onClose: () => void }
export const Movable: FC<Props> = ({ children, onClose }) => {
  const position = usePosition()
  return (
    <div style={{ position: 'fixed', ...position.position, zIndex: 1e10 }}>
      <Column style={{ border: '2px solid var(--fff)' }}>
        <div onMouseDown={position.onMouseDown} onMouseUp={position.onMouseUp}>
          <Row background="var(--fff)" justify="flex-end" padding="s">
            <button onClick={onClose} style={{ fontSize: 30 }}>
              x
            </button>
          </Row>
        </div>
        {children}
      </Column>
    </div>
  )
}
