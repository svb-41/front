import { useState, useEffect, useRef } from 'react'
import * as react from 'react'
import * as Flex from '@/components/flex'
import styles from './components.module.css'

export const TOP_SPACE = 40

export type Position = { top: number; left: number }
export type Size = { width: number; height: number }
type Origin = { x: number; y: number; originX: number; originY: number }
type OriginResize = { x: number; y: number; originH: number; originW: number }
type OldSize = { position: Position; size: Size }

const newPosition = (values: Size) => {
  return (position: Position) => {
    const minLeft = window.innerWidth - values.width
    const left = Math.min(position.left, minLeft)
    const minTop = window.innerHeight - values.height
    const top = Math.min(position.top, minTop)
    return { left, top }
  }
}

/// Init with the initial size of the window. Can be updated afterwards.
const useSize = (fullscreen?: boolean | { size: Size; position: Position }) => {
  const ref = useRef<HTMLDivElement>(null)
  // The two refs are present to avoid adding and removing eventListeners.
  const width_ = useRef<number>()
  const height_ = useRef<number>()
  const [dimensions, setDimensions] = useState<Size>()
  const set = (fun: (size?: Size) => Size | undefined) => {
    setDimensions(s => {
      const size = fun(s)
      if (size) {
        width_.current = size.width
        height_.current = size.height
        return size
      }
    })
  }
  react.useLayoutEffect(() => {
    if (!ref.current) return
    const { width, height } = fullscreen
      ? { width: window.innerWidth, height: window.innerHeight }
      : ref.current.getBoundingClientRect()
    set(() => ({ width, height }))
  }, [])
  const base = { ref, dimensions, set }
  // prettier-ignore
  return {
    ...base,
    get height() { return height_.current },
    get width() { return width_.current },
  }
}

const initPositionFull = { top: 0, left: 0 }
const initPosition = { top: TOP_SPACE + 16, left: 16 }
const useWindow = (props: Props) => {
  const init = props.fullscreen ? initPositionFull : initPosition
  /// Control absolute position and size of window.
  const [position, setPosition] = useState(init)
  const pos = useRef(init)
  useEffect(() => {
    pos.current = { ...position }
  }, [position.top, position.left])
  const size = useSize(props.fullscreen)
  /// Saved initial popup position on drag and drop.
  const origin = useRef<Origin | null>(null)
  const resize = useRef<OriginResize | null>(null)
  /// Save position and size before maximizing.
  const oldSize = useRef<OldSize | null>(null)
  const isMaximized = Boolean(oldSize.current)
  /// Save style for transitionning.
  const [additionalStyle, setAdditionalStyle] = useState({})

  /// End of the movable or resizable flow.
  const mouseup = react.useCallback(() => {
    origin.current = null
    resize.current = null
  }, [])

  /// Setup the resize event listener, and handles the movable flow.
  useEffect(() => {
    /// Callback to resize event listener.
    const onResize = () => {
      if (oldSize.current) {
        const { size, position } = oldSize.current
        const newPos = newPosition(size)(position)
        oldSize.current.position = newPos
      } else if (size.height && size.width) {
        const { width, height } = size
        setPosition(newPosition({ width, height }))
      }
    }

    /// Callback to mousemove event listener.
    const mousemove = (event: MouseEvent) => {
      if (isMaximized || !size.width || !size.height) return
      if (origin.current) {
        const left_ = event.clientX - origin.current.originX
        const bottom_ = event.clientY - origin.current.originY
        const minTop = window.innerHeight - size.height
        const minLeft = window.innerWidth - size.width
        const top = Math.min(Math.max(TOP_SPACE, bottom_), minTop)
        const left = Math.min(Math.max(0, left_), minLeft)
        setPosition({ top, left })
      }
      if (resize.current) {
        size.set(size => {
          if (!size) return size
          if (resize.current) {
            const deltaW = event.clientX - resize.current.x
            const width_ = deltaW + resize.current.originW
            const deltaH = event.clientY - resize.current.y
            const height_ = deltaH + resize.current.originH
            const minWidth = (props.minWidth ?? 0) + 4
            const minHeight = (props.minHeight ?? 0) + 4
            const maxWidth = window.innerWidth - pos.current.left - 2
            const maxHeight = window.innerHeight - pos.current.top - 2
            const width = Math.min(Math.max(width_, minWidth), maxWidth)
            const height = Math.min(Math.max(height_, minHeight), maxHeight)
            return { width, height }
          }
          return size
        })
      }
    }

    /// Register event listeners.
    window.addEventListener('resize', onResize)
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
    /// Clean event listeners.
    return () => {
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousemove', mousemove)
      document.removeEventListener('mouseup', mouseup)
    }
  }, [])

  /// Starts the movable flow. Don't do anything if maximized.
  const onMouseDown = (event: any) => {
    if (isMaximized) return
    origin.current = {
      x: event.clientX,
      y: event.clientY,
      originX: event.clientX - position.left,
      originY: event.clientY - position.top,
    }
  }

  /// Starts the resizable flow. Don't do anything if maximized.
  const onResize = (event: any) => {
    if (isMaximized) return
    resize.current = {
      x: event.clientX,
      y: event.clientY,
      originW: size.width!,
      originH: size.height!,
    }
  }

  const move = (position: Position, size_?: Size) => {
    // const { width, height } = size
    // oldSize.current = { position, size: { width, height } }
    setAdditionalStyle({ transition: 'all 300ms' })
    setTimeout(() => {
      if (size_) size.set(() => size_)
      setPosition(position)
      setTimeout(() => setAdditionalStyle(pos), 300)
    }, 100)
  }

  /// Switch between maximize and windowed mode.
  const maximize = () => {
    if (oldSize.current) {
      const { size, position } = oldSize.current
      const { height, width } = size
      setAdditionalStyle({ transition: 'all 300ms', width, height })
      setPosition(position)
      oldSize.current = null
      setTimeout(() => setAdditionalStyle({}), 300)
    } else {
      if (size.width && size.height) {
        const { width, height } = size
        oldSize.current = { position, size: { width, height } }
        setAdditionalStyle({ transition: 'all 300ms' })
        setTimeout(() => {
          const pos = { width: '100vw', height: '100vh' }
          setPosition({ top: 0, left: 0 })
          setAdditionalStyle({ transition: 'all 300ms', ...pos })
          setTimeout(() => setAdditionalStyle(pos), 300)
        }, 100)
      }
    }
  }

  react.useEffect(() => {
    const fs = props.fullscreen
    if (typeof fs === 'object') {
      move(fs.position, fs.size)
    }
  }, [props.fullscreen])

  /// Styles to apply to movable wrapper.
  const base = { display: 'flex', flexDirection: 'column' }
  const style = { ...base, ...position, ...size.dimensions, ...additionalStyle }

  return { style, onMouseDown, onResize, maximize, ref: size.ref, isMaximized }
}

type Win = ReturnType<typeof useWindow>
type ButtonsProps = { win: Win; onClose?: () => void }
const Buttons = ({ win, onClose }: ButtonsProps) => {
  const visibility = onClose ? 'visible' : 'hidden'
  return (
    <Flex.Row align="center">
      {false && (
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
  minWidth?: number
  minHeight?: number
  padding?: Flex.Size
  onMouseDown?: () => void
  fullscreen?: boolean | { size: Size; position: Position }
  children?: React.ReactNode
}
export const Movable = (props: Props) => {
  const win = useWindow(props)
  const zIndex = props.zIndex ?? 1e10
  const style: any = { position: 'fixed', zIndex, ...win.style }
  const maxHeight = win.isMaximized || props.fullscreen ? 'unset' : undefined
  return (
    <div
      ref={win.ref}
      style={style}
      className={styles.movableWrapper}
      onMouseDown={event => {
        if (props.onMouseDown) props.onMouseDown()
        win.onResize(event)
      }}
    >
      <Flex.Column
        flex={1}
        className={styles.movable}
        minWidth={props.minWidth}
        minHeight={props.minHeight}
        maxHeight={maxHeight}
        onMouseDown={event => {
          if (props.onMouseDown) props.onMouseDown()
          event.stopPropagation()
        }}
      >
        <div onMouseDown={win.onMouseDown} style={{ userSelect: 'none' }}>
          {!props.fullscreen && (
            <Flex.Row
              align="center"
              background="var(--fff)"
              justify={props.title ? 'space-between' : 'flex-end'}
              padding="s"
              height={40}
              onDoubleClick={win.maximize}
            >
              <div className={styles.movableTitle}>{props.title}</div>
              <Buttons win={win} onClose={props.onClose} />
            </Flex.Row>
          )}
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
