import { useState, useEffect, useRef } from 'react'
import * as react from 'react'
import { useSpring, animated } from 'react-spring'
import * as Flex from '@/components/flex'
import * as lib from '@/lib'
import { Dimensions } from '@/lib/window'
import styles from './components.module.css'

export const TOP_SPACE = 40

export type Position = { top: number; left: number }
type Origin = { x: number; y: number; originX: number; originY: number }
type OriginResize = { x: number; y: number; originH: number; originW: number }
type OldSize = { position: Position; size: Dimensions }

const newPosition = (values: Dimensions) => {
  return (position: Position) => {
    const minLeft = window.innerWidth - values.width
    const left = Math.max(Math.min(position.left, minLeft), 0)
    const minTop = window.innerHeight - 40
    const top = Math.max(Math.min(position.top, minTop), 0)
    return { left, top }
  }
}

const computeInitialSize = (props: Props, ref: any) => {
  if (props.fullscreen) {
    if (typeof props.fullscreen === 'object') {
      return props.fullscreen.size
    } else {
      return lib.window.dimensions()
    }
  } else if (props.initialSize?.size) {
    return props.initialSize.size
  } else {
    const { width, height } = ref.current.getBoundingClientRect()
    return { width, height }
  }
}

const computeInitialPosition = (props: Props) => {
  if (props.fullscreen) {
    if (typeof props.fullscreen === 'object') {
      const top = props.fullscreen.position.top + TOP_SPACE
      const left = props.fullscreen.position.left
      return { top, left }
    } else {
      return { top: 0, left: 0 }
    }
  } else if (props.initialSize) {
    const top = (props.initialSize.position?.top ?? 16) + TOP_SPACE
    const left = props.initialSize.position?.left ?? 16
    return { top, left }
  } else {
    return { top: TOP_SPACE + 16, left: 16 }
  }
}

/// Init with the initial size of the window. Can be updated afterwards.
const useSize = (props: Props) => {
  const isFullscreen = useRef(props.fullscreen)
  useEffect(() => {
    isFullscreen.current = props.fullscreen
  }, [props.fullscreen])
  const ref = useRef<HTMLDivElement>(null)
  // The two refs are present to avoid adding and removing eventListeners.
  const [dimensions, api] = useSpring<Dimensions>(() => ({
    height: -1,
    width: -1,
  }))
  const dims = useRef<Dimensions | null>(null)
  const setDimensions = (
    cb: (dims_?: Dimensions) => Dimensions | undefined
  ) => {
    const val = dims.current ? cb(dims.current) : cb()
    if (val) {
      dims.current = val
      api.set(val)
    }
  }
  const width_ = useRef<number>()
  const height_ = useRef<number>()
  const set = (fun: (size?: Dimensions) => Dimensions | undefined) => {
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
    const dims = computeInitialSize(props, ref)
    set(() => dims)
  }, [])
  const base = { ref, dimensions, set, isFullscreen }
  // prettier-ignore
  return {
    ...base,
    get height() { return height_.current },
    get width() { return width_.current },
  }
}

const useWindow = (props: Props) => {
  const init = computeInitialPosition(props)
  /// Control absolute position and size of window.
  const [position, api] = useSpring(() => init)
  const pos = useRef(init)
  const setPosition = (cb: (position: Position) => Position) => {
    const newVal = cb(pos.current)
    pos.current = newVal
    api.set(newVal)
  }
  const size = useSize(props)
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
      const fs = size.isFullscreen.current
      if (fs && typeof fs === 'boolean') {
        const width = window.innerWidth
        const height = window.innerHeight
        size.set(() => ({ width, height }))
      } else if (oldSize.current) {
        const { size, position } = oldSize.current
        const newPos = newPosition(size)(position)
        oldSize.current.position = newPos
      } else if (size.height && size.width) {
        const { width, height } = size
        setPosition(newPosition({ width, height }))
        const dims = lib.window.dimensions()
        if (dims.height <= height || dims.width <= width) {
          size.set(() => {
            const h = Math.min(dims.height, height)
            const w = Math.min(dims.width, width)
            return { height: h, width: w }
          })
        }
      }
    }

    /// Callback to mousemove event listener.
    const mousemove = (event: MouseEvent) => {
      if (isMaximized || !size.width || !size.height) return
      if (origin.current) {
        const left_ = event.clientX - origin.current.originX
        const bottom_ = event.clientY - origin.current.originY
        const minTop = window.innerHeight - 40
        const minLeft = window.innerWidth - size.width
        const top = Math.min(Math.max(TOP_SPACE, bottom_), minTop)
        const left = Math.min(Math.max(0, left_), minLeft)
        setPosition(() => ({ top, left }))
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
      originX: event.clientX - pos.current.left,
      originY: event.clientY - pos.current.top,
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

  const move = (position: Position, dims?: Dimensions) => {
    // const { width, height } = size
    // oldSize.current = { position, size: { width, height } }
    setAdditionalStyle({ transition: 'all 300ms' })
    setTimeout(() => {
      if (dims) size.set(() => dims)
      setPosition(() => position)
      setTimeout(() => setAdditionalStyle(pos), 300)
    }, 100)
  }

  /// Switch between maximize and windowed mode.
  const maximize = () => {
    if (oldSize.current) {
      const { size, position } = oldSize.current
      const { height, width } = size
      setAdditionalStyle({ transition: 'all 300ms', width, height })
      setPosition(() => position)
      oldSize.current = null
      setTimeout(() => setAdditionalStyle({}), 300)
    } else {
      if (size.width && size.height) {
        const { width, height } = size
        oldSize.current = {
          position: { ...pos.current },
          size: { width, height },
        }
        setAdditionalStyle({ transition: 'all 300ms' })
        setTimeout(() => {
          const pos = { width: '100vw', height: '100vh' }
          setPosition(() => ({ top: 0, left: 0 }))
          setAdditionalStyle({ transition: 'all 300ms', ...pos })
          setTimeout(() => setAdditionalStyle(pos), 300)
        }, 100)
      }
    }
  }

  react.useEffect(() => {
    const fs = props.fullscreen
    if (typeof fs === 'object') {
      const { left } = fs.position
      const top = fs.position.top + TOP_SPACE
      move({ left, top }, fs.size)
    }
  }, [props.fullscreen])

  /// Styles to apply to movable wrapper.
  const base: { display: 'flex'; flexDirection: 'column' } = {
    display: 'flex',
    flexDirection: 'column',
  }
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
  opacity?: number
  title?: string
  zIndex?: number
  onClose?: () => void
  minWidth?: number
  minHeight?: number
  padding?: Flex.Size
  onMouseDown?: () => void
  fullscreen?: boolean | { size: Dimensions; position: Position }
  initialSize?: { size?: Dimensions; position?: Position }
  children?: React.ReactNode
}
export const Movable = (props: Props) => {
  const win = useWindow(props)
  const zIndex = props.zIndex ?? 1e10
  const cursor = props.fullscreen ? 'auto' : undefined
  const maxHeight = win.isMaximized || props.fullscreen ? 'unset' : undefined
  return (
    <animated.div
      ref={win.ref}
      style={{
        position: 'fixed',
        zIndex,
        ...win.style,
        cursor,
        opacity: props.opacity ?? 1,
      }}
      className={styles.movableWrapper}
      onMouseDown={event => {
        if (props.onMouseDown) props.onMouseDown()
        if (!props.fullscreen) win.onResize(event)
      }}
    >
      <Flex.Column
        width="100%"
        height="100%"
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
          height={props.fullscreen ? '100%' : 'calc(100% - 40px)'}
          padding={props.padding}
          background="var(--eee)"
        >
          {props.children}
        </Flex.Column>
      </Flex.Column>
    </animated.div>
  )
}
