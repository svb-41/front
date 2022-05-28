import {
  useState,
  useImperativeHandle,
  useRef,
  useMemo,
  useContext,
  createContext,
  forwardRef,
} from 'react'
import { useTransition, animated, config } from 'react-spring'
import { Column, Row } from '@/components/flex'
import { App } from './app'
import * as Movable from '../movable'
import styles from './desktop.module.css'

// @ts-ignore
const Context: React.Context<Handler> = createContext(null)
export const useDesktop = () => useContext(Context)

const RenderMenu = (props: AppBarProps) => (
  <Column
    background="var(--fff)"
    padding="s"
    className={styles.unrolledMenu}
    style={{ top: `calc(40px + var(--s))` }}
  >
    {['Open new test…', 'Open new test…', 'Open new test…'].map(item => {
      const onClick = props.onClick
      const className = styles.unrolledMenuItem
      const p = { onClick, className }
      return <div {...p}>{item}</div>
    })}
  </Column>
)

type AppBarProps = {
  activeApp?: string
  setActiveApp: (value: string) => void
  apps: App[]
  onClick: () => void
}
const AppBar = (props: AppBarProps) => {
  const { activeApp, setActiveApp, apps, onClick } = props
  const [openMenu, setOpenMenu] = useState(false)
  const menuItemCl = openMenu ? styles.menuButtonOpened : styles.menuButton
  const close = (click: boolean) => () => {
    setOpenMenu(false)
    if (click) onClick()
  }
  const toggle = () => setOpenMenu(t => !t)
  return (
    <Row
      height={40}
      align="center"
      background="var(--fff)"
      padding="s"
      style={{ position: 'relative' }}
      gap="s"
    >
      <div className={menuItemCl} onClick={toggle}>
        Menu
      </div>
      {openMenu && <RenderMenu {...props} onClick={close(true)} />}
      {openMenu && <div className={styles.overlay} onClick={close(false)} />}
      <Row flex={1} overflow="auto" className={styles.menuOverflow}>
        {apps.map(app => {
          const className = app.id === activeApp ? styles.active : styles.app
          const onClick = () => setActiveApp(app.id)
          const key = app.id
          return <div {...{ onClick, className, key }}>{app.name}</div>
        })}
      </Row>
    </Row>
  )
}

const Window = animated(Movable.Movable)

export type Handler = {
  apps: {
    get: () => App[]
    add: (app: App) => void
    close: (id: string) => void
    replace: (apps: App[]) => void
  }
}
export type Props = { apps: App | App[] | (() => App) | (() => App[]) }
export const Desktop = forwardRef((props: Props, ref: React.Ref<Handler>) => {
  const [activeApp, setActiveApp] = useState<string>()
  const [apps, setApps] = useState<App[]>(() => {
    const a = typeof props.apps === 'function' ? props.apps() : props.apps
    const ret = [a].flat()
    return ret
  })
  const appBarRef = useRef<HTMLDivElement>(null)
  const handler = useMemo(() => {
    const close = (id: string) => setApps(a => a.filter(app => app.id !== id))
    const get = () => apps
    const add = (app: App) =>
      setApps(apps => {
        const newA = { ...app, zIndex: app.zIndex + apps.length + 2 }
        return [...apps, newA]
      })
    const replace = (apps: App[]) => setApps(apps)
    const apps_ = { get, add, replace, close }
    return { apps: apps_ }
  }, [apps])
  useImperativeHandle(ref, () => handler, [handler])
  const focusApp = (id: string) => {
    setActiveApp(id)
    setApps(a => {
      return a.map(app => {
        if (app.id === id) return { ...app, zIndex: a.length + 1 }
        const zIndex = app.zIndex - 1
        return { ...app, zIndex }
      })
    })
  }
  const transitions = useTransition(apps, {
    keys: app => app.id,
    from: { opacity: 1 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 150 },
  })
  return (
    <Context.Provider value={handler}>
      <Column flex={1} overflow="hidden" background="var(--eee)">
        <div ref={appBarRef} style={{ userSelect: 'none' }}>
          <AppBar
            activeApp={activeApp}
            setActiveApp={focusApp}
            apps={apps}
            onClick={() => {}}
          />
        </div>
        <div style={{ position: 'relative', flex: 1 }}>
          <div className={styles.wallpaper} />
          {transitions(({ opacity }, app) => (
            <Window
              opacity={opacity}
              initialSize={app.initialSize}
              fullscreen={app.fullscreen}
              onMouseDown={() => focusApp(app.id)}
              title={app.name}
              key={app.id}
              zIndex={app.zIndex + 1000}
              onClose={() => handler.apps.close(app.id)}
              minWidth={300}
              minHeight={300}
              padding={app.padding}
            >
              {app.render}
            </Window>
          ))}
        </div>
      </Column>
    </Context.Provider>
  )
})
