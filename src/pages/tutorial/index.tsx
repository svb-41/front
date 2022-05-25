import { useState, useRef, useLayoutEffect } from 'react'
import { Column, Row } from '@/components/flex'
import * as Movable from '@/components/movable'
import { Introduction } from './introduction'
import * as uuid from 'uuid'
import styles from './tutorial.module.css'
export type Page = 'introduction' | 'start'

const RenderMenu = (props: AppBarProps) => {
  const top = `calc(40px + var(--s))`
  return (
    <Column
      background="var(--fff)"
      padding="s"
      className={styles.unrolledMenu}
      style={{ top }}
    >
      <div className={styles.unrolledMenuItem} onClick={props.onClick}>
        Open new test…
      </div>
      <div className={styles.unrolledMenuItem} onClick={props.onClick}>
        Open new test…
      </div>
      <div className={styles.unrolledMenuItem} onClick={props.onClick}>
        Open new test…
      </div>
      <div className={styles.unrolledMenuItem} onClick={props.onClick}>
        Open new test…
      </div>
    </Column>
  )
}

type AppBarProps = {
  activeApp?: string
  setActiveApp: (value: string) => void
  apps: App[]
  onClick: () => void
}
const AppBar = (props: AppBarProps) => {
  const { activeApp, setActiveApp, apps, onClick } = props
  const [openMenu, setOpenMenu] = useState(false)
  return (
    <Row
      height={40}
      align="center"
      background="var(--fff)"
      padding="s"
      style={{ position: 'relative' }}
      gap="s"
    >
      <div
        className={styles.menuItem}
        style={{
          background: openMenu ? 'var(--eee)' : undefined,
          borderLeft: 'none',
        }}
        onClick={() => setOpenMenu(t => !t)}
      >
        Menu
      </div>
      {openMenu && (
        <RenderMenu
          {...props}
          onClick={() => {
            setOpenMenu(false)
            onClick()
          }}
        />
      )}
      {openMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
          onClick={() => setOpenMenu(false)}
        />
      )}
      <Row flex={1} overflow="auto" className={styles.menuOverflow}>
        {apps.map(app => {
          const cl = app.id === activeApp ? styles.active : styles.app
          return (
            <div
              onClick={() => setActiveApp(app.id)}
              className={cl}
              key={app.id}
            >
              {app.name}
            </div>
          )
        })}
      </Row>
    </Row>
  )
}

export type App = {
  id: string
  name: string
  content: React.ReactNode
  zIndex: number
  fullscreen?:
    | boolean
    | {
        size: Movable.Size
        position: Movable.Position
      }
}

export const Desktop = () => {
  const [activeApp, setActiveApp] = useState<string>()
  const [apps, setApps] = useState<App[]>(() => {
    const id = uuid.v4()
    return [
      {
        name: 'Tutorial',
        id,
        content: (
          <Introduction
            onNext={() =>
              setApps(apps => {
                return apps.map(app => {
                  if (app.id !== id) return app
                  return {
                    ...app,
                    fullscreen: {
                      size: { width: 320, height: 320 },
                      position: { top: Movable.TOP_SPACE + 12, left: 12 },
                    },
                  }
                })
              })
            }
          />
        ),
        zIndex: 1,
        fullscreen: true,
      },
    ]
  })
  const appBarRef = useRef<HTMLDivElement>(null)
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
  // const addApp = () => {
  //   setApps(a => {
  //     const id = uuid.v4()
  //     setActiveApp(id)
  //     const content = (
  //       <div style={{ maxWidth: 400, fontFamily: 'Unifont' }}>
  //         Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
  //         eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
  //         minim veniam, quis nostrud exercitation ullamco laboris nisi ut
  //         aliquip ex ea commodo consequat. Duis aute irure dolor in
  //         reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
  //         pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
  //         culpa qui officia deserunt mollit anim id est laborum.
  //       </div>
  //     )
  //     const name = 'Test'
  //     const zIndex = a.length + 1
  //     const app = { id, name, content, zIndex }
  //     return [...a, app]
  //   })
  // }
  return (
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
        {apps.map(app => (
          <Movable.Movable
            fullscreen={app.fullscreen}
            onMouseDown={() => focusApp(app.id)}
            title={app.name}
            key={app.id}
            zIndex={app.zIndex + 1000}
            onClose={() => setApps(a => a.filter(({ id }) => app.id !== id))}
            minWidth={300}
            minHeight={300}
            padding="l"
          >
            {app.content}
          </Movable.Movable>
        ))}
      </div>
    </Column>
  )
}

export const Tutorial = () => {
  return <Desktop></Desktop>
}
