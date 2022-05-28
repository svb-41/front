import {
  useState,
  useImperativeHandle,
  useRef,
  useMemo,
  useContext,
  useEffect,
  createContext,
  forwardRef,
} from 'react'
import { useTransition, animated, config } from 'react-spring'
import { Column, Row } from '@/components/flex'
import { App } from './app'
import * as Movable from '../movable'
import styles from './desktop.module.css'
import { v4 as uuid } from 'uuid'

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
      style={{ position: 'relative', zIndex: 10000 }}
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
          const id = app.id
          return <div {...{ onClick, className, key, id }}>{app.name}</div>
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
  const appBarRef = useRef<HTMLDivElement>(null)
  const [activeApp, setActiveApp] = useState<string>()
  const [apps, setApps] = useState<App[]>(() => {
    const a = typeof props.apps === 'function' ? props.apps() : props.apps
    const ret = [a].flat()
    return ret
  })
  useEffect(() => {
    setApps(apps =>
      apps.map(app => {
        if (app.id === activeApp)
          if (typeof app.fullscreen === 'object')
            if (app.fullscreen.size.width === 10)
              return { ...app, fullscreen: false }
        return app
      })
    )
  }, [activeApp])
  const handler = useMemo(() => {
    const minimize = (id: string) => {
      const div = appBarRef.current
      if (!div) return
      const row = div.children[0]?.children[1]
      if (!row) return
      for (const item of row.children) {
        if (item.id === id) {
          const sizes = item.getBoundingClientRect()
          setApps(apps =>
            apps.map(a => {
              if (a.id === id) {
                return {
                  ...a,
                  fullscreen: {
                    size: { width: 10, height: 10 },
                    position: {
                      top: sizes.top - Movable.TOP_SPACE,
                      left: sizes.left,
                    },
                  },
                }
              }
              return a
            })
          )
          setActiveApp(undefined)
        }
      }
    }
    const close = (id: string) => setApps(a => a.filter(app => app.id !== id))
    const get = () => apps
    const add = (app: App) =>
      setApps(apps => {
        const newA = { ...app, zIndex: app.zIndex + apps.length + 2 }
        return [...apps, newA]
      })
    const replace = (apps: App[]) => setApps(apps)
    const apps_ = { get, add, replace, close, minimize }
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
            onClick={() =>
              handler.apps.add({
                name: 'Test',
                id: uuid(),
                zIndex: 1,
                render: <div>Test</div>,
              })
            }
          />
        </div>
        <div style={{ position: 'relative', flex: 1 }}>
          <div className={styles.wallpaper} />
          {transitions(({ opacity }, app) => (
            <Window
              minimize={() => handler.apps.minimize(app.id)}
              opacity={opacity}
              initialSize={app.initialSize}
              fullscreen={app.fullscreen}
              onMouseDown={() => focusApp(app.id)}
              title={app.name}
              key={app.id}
              zIndex={app.zIndex + 1000}
              onClose={() => handler.apps.close(app.id)}
              minWidth={app.fullscreen ? 0 : 300}
              minHeight={app.fullscreen ? 0 : 300}
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
