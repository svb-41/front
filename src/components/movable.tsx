import { FC, useState, useEffect, useLayoutEffect, useRef } from 'react'
import * as Flex from '@/components/flex'
import styles from './components.module.css'

const highTop = 40

const newPosition = (values: { width: number; height: number }) => {
  return (position: { top: number; left: number }) => {
    const minLeft = window.innerWidth - values.width
    const left = Math.min(position.left, minLeft)
    const minTop = window.innerHeight - values.height
    const top = Math.min(position.top, minTop)
    return { left, top }
  }
}

const useWindow = () => {
  /// Control absolute position and size of window.
  const [position, setPosition] = useState({ top: highTop + 24, left: 24 })
  const [size, setSize] = useState<{ width: number; height: number }>()
  /// Saved initial popup position on drag and drop.
  const popupRef = useRef<any>(null)
  const divRef = useRef<any>(null)
  const values = useRef<any>(null)
  /// Save position and size before maximizing.
  const oldSize = useRef<any>(null)
  const isMaximized = Boolean(oldSize.current)
  /// Save style for transitionning.
  const [additionalStyle, setAdditionalStyle] = useState({})

  /// End of the movable flow.
  const mouseup = () => (popupRef.current = null)

  /// Computes the initial size of the window. Mandatory for resize.
  useLayoutEffect(() => {
    if (divRef.current) {
      const { width, height } = divRef.current.getBoundingClientRect()
      setSize({ width, height })
    }
  }, [])

  /// Setup the resize event listener, and handles the movable flow.
  useEffect(() => {
    /// Callback to resize event listener.
    const resize = () => {
      if (isMaximized) {
        const newPos = newPosition(oldSize.current)(oldSize.current.position)
        oldSize.current.position = newPos
      } else {
        values.current = divRef.current?.getBoundingClientRect?.() ?? null
        setPosition(newPosition(values.current))
      }
    }

    /// Callback to mousemove event listener.
    const mousemove = (event: MouseEvent) => {
      if (isMaximized) return
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

    /// Register event listeners.
    window.addEventListener('resize', resize)
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
    /// Clean event listeners.
    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', mousemove)
      document.removeEventListener('mouseup', mouseup)
    }
  }, [])

  /// Starts the movable flow. Don't do anything if maximized.
  const onMouseDown = (event: any) => {
    if (isMaximized) return
    popupRef.current = {
      x: event.clientX,
      y: event.clientY,
      originX: event.clientX - position.left,
      originY: event.clientY - position.top,
    }
  }

  /// Switch between maximize and windowed mode.
  const maximize = () => {
    if (isMaximized) {
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

  /// Styles to apply to movable wrapper.
  const base = { display: 'flex', flexDirection: 'column' }
  const style = { ...base, ...position, ...size, ...additionalStyle }

  return { style, onMouseDown, maximize, ref: divRef, isMaximized }
}

type Win = ReturnType<typeof useWindow>
type ButtonsProps = { win: Win; onClose?: () => void }
const Buttons = ({ win, onClose }: ButtonsProps) => {
  const visibility = onClose ? 'visible' : 'hidden'
  return (
    <Flex.Row align="center">
      {true && (
        <button onClick={win.maximize} style={{ fontSize: 25 }}>
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
  const win = useWindow()
  const zIndex = props.zIndex ?? 1e10
  const style: any = { position: 'fixed', zIndex, ...win.style }
  const maxHeight = win.isMaximized ? 'unset' : '90vh'
  return (
    <div ref={win.ref} style={style} onMouseDown={props.onMouseDown}>
      <Flex.Column
        className={styles.movable}
        minWidth={props.minWidth}
        minHeight={props.minHeight}
        maxHeight={maxHeight}
        flex={1}
      >
        <div onMouseDown={win.onMouseDown} style={{ userSelect: 'none' }}>
          <Flex.Row
            align="center"
            background="var(--fff)"
            justify={props.title ? 'space-between' : 'flex-end'}
            padding="s"
            height={40}
          >
            <div className={styles.movableTitle}>{props.title}</div>
            <Buttons win={win} onClose={props.onClose} />
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
