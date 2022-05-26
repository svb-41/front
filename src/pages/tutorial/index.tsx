import { useState, useRef, useCallback } from 'react'
import { Column, Row } from '@/components/flex'
import * as Flex from '@/components/flex'
import * as Movable from '@/components/movable'
import { Introduction } from './introduction'
import styles from './tutorial.module.css'
import { Fight } from '@/components/fight'
import { useSelector } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import * as actions from '@/store/actions'
import { Dimensions, dimensions, useResize } from '@/lib/window'
import * as Desktop from '@/components/desktop'
import { useDesktop } from '@/components/desktop'
import { AI } from '@/lib/ai'
import { getSimulation } from '@/services/mission'
import * as svb from '@svb-41/engine'
import { getMissionEnemy } from '@/lib/engine'

export type Page = 'introduction' | 'start'

const onResize = (force: boolean) => {
  return (dims: Dimensions, apps: Desktop.App[]) => {
    return apps.map(app => {
      if (typeof app.fullscreen !== 'object' && !force) return app
      if (app.id === 'Tutorial') {
        const height = dims.height - 4 - Movable.TOP_SPACE - 24
        const size = { width: 400, height }
        const position = { top: 12, left: 12 }
        return { ...app, fullscreen: { size, position } }
      }
      if (app.name === 'Fight') {
        const width = dims.width - 400 - 12 - 12 - 12
        const height = dims.height - 4 - Movable.TOP_SPACE - 24
        const size = { height, width }
        const position = { top: 12, left: dims.width - 12 - width }
        return { ...app, fullscreen: { position, size } }
      }
      return app
    })
  }
}

const onStartFight = (ais_: AI[], desktop: Desktop.Handler) => {
  const ai = ais_[0]
  const width = window.innerWidth - 400 - 12 - 12 - 12
  const height = window.innerHeight - 4 - Movable.TOP_SPACE - 24
  const left = window.innerWidth - 12 - width
  const position = { top: 12, left }
  const size = { height, width }
  const mission = getSimulation('0')!
  const shipClass = svb.engine.ship.SHIP_CLASS.FIGHTER
  const ships = [{ shipClass, id: 'meh', x: 50, y: 300, rotation: 90 }]
  const ais = [{ aid: ai.id, sid: 'meh' }]
  const enemy = getMissionEnemy(mission, 'red')
  desktop.apps.add({
    name: 'Fight',
    id: 'Fight',
    zIndex: 1,
    fullscreen: { position, size },
    render: (
      <Fight
        team="blue"
        enemy={enemy}
        fleet={{ ships, ais }}
        mission={mission}
        ais={ais_}
        onEnd={() => console.log('=> [Tutorial] Ended')}
        onStart={() => console.log('=> [Tutorial] Started')}
      />
    ),
  })
}

const Intro = () => {
  const desktop = useDesktop()
  const ais = useSelector(selectors.ais)
  return (
    <Introduction
      onStartFight={() => onStartFight(ais.ais, desktop)}
      onNext={() => {
        const dims = dimensions()
        const apps = desktop.apps.get()
        const newApps = onResize(true)(dims, apps)
        desktop.apps.replace(newApps)
      }}
    />
  )
}

export const Tutorial = () => {
  const resizer = useCallback(onResize(false), [])
  const desktop = useRef<Desktop.Handler>(null)
  useResize(dims => {
    if (desktop.current) {
      const current = desktop.current.apps.get()
      const apps = resizer(dims, current)
      desktop.current.apps.replace(apps)
    }
  })
  return (
    <Desktop.Desktop
      ref={desktop}
      apps={{
        name: 'Tutorial',
        id: 'Tutorial',
        padding: 'l',
        zIndex: 1,
        fullscreen: true,
        render: <Intro />,
      }}
    />
  )
}
