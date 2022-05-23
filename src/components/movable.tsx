import { FC, useState, useEffect, useRef } from 'react'
import * as Flex from '@/components/flex'

const usePosition = (maxTop?: number) => {
  const highTop = maxTop ?? 40
  const [position, setPosition] = useState({ top: highTop + 24, left: 24 })
  const popupRef = useRef<any>(null)
  const divRef = useRef<any>(null)
  const values = useRef<any>(null)
  const mouseup = () => (popupRef.current = null)
  useEffect(() => {
    const resize = () => {
      values.current = divRef.current?.getBoundingClientRect?.() ?? null
      if (values.current) {
        setPosition(position => {
          const minLeft = window.innerWidth - values.current.width
          const left = Math.min(position.left, minLeft)
          const minTop = window.innerHeight - values.current.height
          const top = Math.min(position.top, minTop)
          return { left, top }
        })
      }
    }
    const mousemove = (event: MouseEvent) => {
      if (!values.current)
        if (!divRef.current) return
        else values.current = divRef.current.getBoundingClientRect()
      if (popupRef.current) {
        const left_ = event.clientX - popupRef.current.originX
        const bottom_ = event.clientY - popupRef.current.originY
        const minTop = window.innerHeight - values.current!.height
        const minLeft = window.innerWidth - values.current!.width
        const top = Math.min(Math.max(highTop, bottom_), minTop)
        const left = Math.min(Math.max(0, left_), minLeft)
        setPosition({ top, left })
      }
    }
    window.addEventListener('resize', resize)
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', mousemove)
      document.removeEventListener('mouseup', mouseup)
    }
  }, [maxTop])
  const onMouseDown = (event: any) => {
    popupRef.current = {
      x: event.clientX,
      y: event.clientY,
      originX: event.clientX - position.left,
      originY: event.clientY - position.top,
    }
  }
  return { position, onMouseDown, ref: divRef }
}

export type Props = {
  title?: string
  zIndex?: number
  onClose: () => void
  minWidth?: number | string
  minHeight?: number | string
  maxTop?: number
  padding?: Flex.Size
  onMouseDown?: () => void
}
export const Movable: FC<Props> = props => {
  const position = usePosition(props.maxTop)
  const zIndex = props.zIndex ?? 1e10
  const style: any = { position: 'fixed', ...position.position, zIndex }
  return (
    <div ref={position.ref} style={style} onMouseDown={props.onMouseDown}>
      <Flex.Column
        minWidth={props.minWidth}
        minHeight={props.minHeight}
        style={{
          border: '2px solid var(--fff)',
          overflow: 'hidden',
          maxHeight: '90vh',
        }}
      >
        <div onMouseDown={position.onMouseDown} style={{ userSelect: 'none' }}>
          <Flex.Row
            align="center"
            background="var(--fff)"
            justify={props.title ? 'space-between' : 'flex-end'}
            padding="s"
          >
            <div
              style={{
                maxWidth: 200,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                paddingLeft: 'var(--s)',
              }}
            >
              {props.title}
            </div>
            <button onClick={props.onClose} style={{ fontSize: 30 }}>
              x
            </button>
          </Flex.Row>
        </div>
        <Flex.Column
          overflow="auto"
          flex={1}
          padding={props.padding}
          background="var(--eee)"
        >
          {props.children}
        </Flex.Column>
      </Flex.Column>
    </div>
  )
}
