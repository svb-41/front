import { FC, useState, useEffect, useRef } from 'react'
import { Column, Row } from '@/components/flex'

const usePosition = () => {
  const [position, setPosition] = useState({ bottom: 24, right: 24 })
  const popupRef = useRef<any>(null)
  const divRef = useRef<any>(null)
  const values = useRef<any>(null)
  useEffect(() => {
    const resizer = () =>
      (values.current = divRef.current?.getBoundingClientRect?.() ?? null)
    const fun = (event: MouseEvent) => {
      if (!values.current)
        if (divRef.current) {
          values.current = divRef.current.getBoundingClientRect()
        } else {
          return
        }

      if (popupRef.current) {
        const x_ = popupRef.current.x - event.clientX
        const y_ = popupRef.current.y - event.clientY
        const right_ = x_ + popupRef.current.initialPosition.right
        const bottom_ = y_ + popupRef.current.initialPosition.bottom
        const bottom = Math.min(
          Math.max(0, bottom_),
          window.innerHeight - values.current!.height
        )
        const right = Math.min(
          Math.max(0, right_),
          window.innerWidth - values.current!.width
        )
        setPosition({ bottom, right })
      }
    }
    document.addEventListener('resize', resizer)
    document.addEventListener('mousemove', fun)
    return () => {
      document.removeEventListener('mousemove', fun)
      document.removeEventListener('resize', resizer)
    }
  }, [])
  const onMouseDown = (event: any) => {
    popupRef.current = {
      x: event.clientX,
      y: event.clientY,
      initialPosition: position,
    }
  }
  const onMouseUp = () => (popupRef.current = null)
  return { position, onMouseDown, onMouseUp, ref: divRef }
}

export type Props = { onClose: () => void }
export const Movable: FC<Props> = ({ children, onClose }) => {
  const position = usePosition()
  return (
    <div
      ref={position.ref}
      style={{ position: 'fixed', ...position.position, zIndex: 1e10 }}
    >
      <Column
        style={{
          border: '2px solid var(--fff)',
          overflow: 'hidden',
          maxHeight: '90vh',
        }}
      >
        <div onMouseDown={position.onMouseDown} onMouseUp={position.onMouseUp}>
          <Row background="var(--fff)" justify="flex-end" padding="s">
            <button onClick={onClose} style={{ fontSize: 30 }}>
              x
            </button>
          </Row>
        </div>
        <Column flex={1} style={{ overflow: 'auto' }}>
          {children}
        </Column>
      </Column>
    </div>
  )
}
