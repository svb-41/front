import { FC, useState, useEffect, useLayoutEffect, useRef } from 'react'
import * as Flex from '@/components/flex'
import styles from './components.module.css'

const newPosition = (values: { width: number; height: number }) => {
  return (position: { top: number; left: number }) => {
    const minLeft = window.innerWidth - values.width
    const left = Math.min(position.left, minLeft)
    const minTop = window.innerHeight - values.height
    const top = Math.min(position.top, minTop)
    return { left, top }
  }
}

const usePosition = () => {
  const highTop = 40
  const [position, setPosition] = useState({ top: highTop + 24, left: 24 })
  const [size, setSize] = useState<{ width: number; height: number }>()
  const popupRef = useRef<any>(null)
  const divRef = useRef<any>(null)
  const values = useRef<any>(null)
  const oldSize = useRef<any>(null)
  const [additionalStyle, setAdditionalStyle] = useState({})
  const mouseup = () => (popupRef.current = null)
  const maximized = Boolean(oldSize.current)
  useLayoutEffect(() => {
    if (divRef.current) {
      const { width, height } = divRef.current.getBoundingClientRect()
      setSize({ width, height })
    }
  }, [])
  useEffect(() => {
    const resize = () => {
      if (maximized) {
        const newPos = newPosition(oldSize.current)(oldSize.current.position)
        oldSize.current.position = newPos
      } else {
        values.current = divRef.current?.getBoundingClientRect?.() ?? null
        setPosition(newPosition(values.current))
      }
    }
    const mousemove = (event: MouseEvent) => {
      if (maximized) return
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
  }, [])
  const onMouseDown = (event: any) => {
    if (maximized) return
    popupRef.current = {
      x: event.clientX,
      y: event.clientY,
      originX: event.clientX - position.left,
      originY: event.clientY - position.top,
    }
  }
  const maximize = () => {
    if (maximized) {
      const { height, width, position } = oldSize.current
      setAdditionalStyle({ transition: 'all 300ms', width, height })
      setPosition(position)
      oldSize.current = null
      setTimeout(() => setAdditionalStyle({}), 300)
    } else {
      if (divRef.current && size) {
        const { width, height } = size
        oldSize.current = { position, width, height }
        setAdditionalStyle({ transition: 'all 300ms', width, height })
        setTimeout(() => {
          const pos = { width: '100vw', height: '100vh' }
          setPosition({ top: 0, left: 0 })
          setAdditionalStyle({ transition: 'all 300ms', ...pos })
          setTimeout(() => setAdditionalStyle(pos), 300)
        }, 100)
      }
    }
  }
  const base = { display: 'flex', flexDirection: 'column' }
  const style = { ...base, ...position, ...size, ...additionalStyle }
  return { style, onMouseDown, maximize, ref: divRef, maximized }
}

type Position = ReturnType<typeof usePosition>
type ButtonsProps = { position: Position; onClose?: () => void }
const Buttons = ({ position, onClose }: ButtonsProps) => {
  const visibility = onClose ? 'visible' : 'hidden'
  return (
    <Flex.Row align="center">
      {true && (
        <button onClick={position.maximize} style={{ fontSize: 25 }}>
          □
        </button>
      )}
      <button onClick={onClose} style={{ fontSize: 30, visibility }}>
        x
      </button>
    </Flex.Row>
  )
}

export type Props = {
  title?: string
  zIndex?: number
  onClose?: () => void
  minWidth?: number | string
  minHeight?: number | string
  padding?: Flex.Size
  onMouseDown?: () => void
}
export const Movable: FC<Props> = props => {
  const position = usePosition()
  const zIndex = props.zIndex ?? 1e10
  const style: any = { position: 'fixed', zIndex, ...position.style }
  const maxHeight = position.maximized ? 'unset' : '90vh'
  return (
    <div ref={position.ref} style={style} onMouseDown={props.onMouseDown}>
      <Flex.Column
        className={styles.movable}
        minWidth={props.minWidth}
        minHeight={props.minHeight}
        maxHeight={maxHeight}
        flex={1}
      >
        <div onMouseDown={position.onMouseDown} style={{ userSelect: 'none' }}>
          <Flex.Row
            align="center"
            background="var(--fff)"
            justify={props.title ? 'space-between' : 'flex-end'}
            padding="s"
            height={40}
          >
            <div className={styles.movableTitle}>{props.title}</div>
            <Buttons position={position} onClose={props.onClose} />
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
