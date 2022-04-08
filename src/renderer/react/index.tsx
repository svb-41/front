import { useEffect, useRef, useState } from 'react'
import { engine, helpers } from '@svb-41/engine'
import { Labeled } from '@/components/ship'
import { Row, Column } from '@/components/flex'
import { getImage } from '@/helpers/ships'
import * as Logger from '@/renderer/logger'
import { Engine } from '@/renderer/engine'
import styles from '@/renderer/react/renderer.module.css'
import shipStyles from '@/components/ship/ship.module.css'
import backgroundTile from '@/assets/backgrounds/black.png'
import s from '@/strings.json'

const handleSpacebar = (onClick: () => void) => {
  return (event: KeyboardEvent) => {
    if (event.code === 'Space') onClick()
  }
}

const handleLog = (setLogs: (cb: (value: string[]) => string[]) => void) => {
  return (event: Event) => {
    type OnLog = { args: any[] }
    const evt = event as CustomEvent<OnLog>
    const now = Math.round(Date.now() / 1000)
    setLogs(logs => [...evt.detail.args.map(arg => `[${now}] ${arg}`), ...logs])
  }
}

type PausedState = 'paused' | 'resumed'
type PauseProps = { state: PausedState; onClick: () => void }
const Pause = ({ state, onClick }: PauseProps) => {
  useEffect(() => {
    const handler = handleSpacebar(onClick)
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClick])
  const text = state === 'paused' ? s.renderer.resume : s.renderer.pause
  const background =
    state === 'resumed' ? 'var(--ts-blue)' : 'var(--team-green)'
  return (
    <button className={styles.pause} style={{ background }} onClick={onClick}>
      {text}
    </button>
  )
}

const RenderShip = ({ ship }: { ship: engine.ship.Ship }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'stats'>('details')
  const name = ship.shipClass.toUpperCase()
  const stats: any = (engine.config.ship as any)[name]
  const isActive = (value: string) =>
    activeTab === value ? styles.activeTab : styles.tab
  return (
    <Row className={styles.renderShip} padding="m" align="center">
      <Column gap="s" className={shipStyles.infos}>
        <Labeled label="ID" content={stats.id} className={shipStyles.id} />
        <Column>
          <Row>
            <button
              className={isActive('details')}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={isActive('stats')}
              onClick={() => setActiveTab('stats')}
            >
              Stats
            </button>
          </Row>
          {activeTab === 'details' && (
            <Row gap="m" flex={1} background="var(--ddd)" padding="m">
              <Column gap="s">
                Infos
                <Column gap="xs" background="var(--ccc)" padding="m">
                  <Labeled
                    label="Bullets Fired"
                    content={ship.bulletsFired.toFixed(0)}
                  />
                  <Labeled
                    label="Destroyed"
                    content={ship.destroyed ? 'true' : 'false'}
                  />
                  <Labeled label="Stealth" content={ship.stealth} />
                </Column>
              </Column>
              <Column gap="s">
                Position
                <Column gap="xs" background="var(--ccc)" padding="m">
                  <Labeled label="x" content={ship.position.pos.x} />
                  <Labeled label="y" content={ship.position.pos.y} />
                  <Labeled label="speed" content={ship.position.speed} />
                  <Labeled
                    label="direction"
                    content={ship.position.direction}
                  />
                </Column>
              </Column>
              {ship.weapons.map((weapon, index) => (
                <Column gap="s" key={index}>
                  Weapon #{index}
                  <Column gap="xs" background="var(--ccc)" padding="m">
                    <Labeled
                      label="Bullet"
                      style={{ textTransform: 'capitalize' }}
                      content={weapon.bullet.id.replace(/-/g, ' ')}
                    />
                    <Labeled
                      label="Munitions"
                      content={weapon.amo.toFixed(0)}
                    />
                    <Labeled
                      label="Cool down"
                      content={weapon.coolDown.toFixed(0)}
                    />
                  </Column>
                </Column>
              ))}
            </Row>
          )}
          {activeTab === 'stats' && (
            <Row gap="m" flex={1} background="var(--ddd)" padding="m">
              <Column gap="s">
                Infos
                <Column gap="s" background="var(--ccc)" padding="m">
                  <Labeled
                    label="Class"
                    content={stats.shipClass}
                    className={shipStyles.class}
                  />
                  <Labeled label="Size" content={stats.stats.size} />
                  <Labeled
                    label="Acceleration"
                    content={stats.stats.acceleration}
                  />
                  <Labeled label="Turn" content={stats.stats.turn} />
                  <Labeled label="Detection" content={stats.stats.detection} />
                  <Labeled label="Visibility" content={stats.stealth} />
                </Column>
              </Column>
              <div className={shipStyles.weapons}>
                {stats.weapons.map((weapon: any, index: number) => (
                  <Column gap="s" key={index}>
                    Weapon #{index}
                    <Column gap="s" background="var(--ccc)" padding="m">
                      <Labeled label="ID" content={weapon.bullet.id} />
                      <Labeled
                        label="Speed"
                        content={weapon.bullet.position.speed}
                      />
                      <Labeled
                        label="Size"
                        content={weapon.bullet.stats.size}
                      />
                      <Labeled
                        label="Acceleration"
                        content={weapon.bullet.stats.acceleration}
                      />
                      <Labeled
                        label="Turn"
                        content={weapon.bullet.stats.turn}
                      />
                      <Labeled
                        label="Detection"
                        content={weapon.bullet.stats.detection}
                      />
                      <Labeled label="Range" content={weapon.bullet.range} />
                      <Labeled
                        label="Cool Down"
                        content={weapon.bullet.coolDown}
                      />
                      <Labeled label="Munitions" content={weapon.amo} />
                    </Column>
                  </Column>
                ))}
              </div>
            </Row>
          )}
        </Column>
      </Column>
      <img
        src={getImage(name, ship.team)}
        className={shipStyles.img}
        alt="ship"
      />
    </Row>
  )
}

export type Props = {
  engine: engine.Engine
  opts: { pos?: { x: number; y: number }; scale?: number }
}
export const Renderer = ({ engine, opts }: Props) => {
  const [ship, setShip] = useState<engine.ship.Ship | undefined>()
  const [pausedState, setPausedState] = useState<PausedState>('resumed')
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const renderer = useRef<Engine | null>(null)
  const div = useRef<HTMLDivElement | null>(null)
  const updater = () => {
    const newState = pausedState === 'paused' ? 'resumed' : 'paused'
    setPausedState(newState)
    const detail = { paused: newState === 'paused' }
    renderer.current?.dispatchEvent(new CustomEvent('state.pause', { detail }))
  }
  const onSelectShip = (event: Event) => {
    const evt = event as CustomEvent
    // const _pos = evt.detail.pos as { x: number; y: number }
    setShip(evt.detail.ship)
  }
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    helpers.console.log('=> [RendererReact] Run')
    if (canvas.current && div.current) {
      const updater = () => setRunning(false)
      const handler = handleLog(setLogs)
      const clearHandler = () => setLogs([])
      renderer.current = new Engine(canvas.current, div.current, engine, {
        ...opts,
        onTick: () => {
          setShip(s => {
            if (!s) return
            return engine.state.ships.find(s_ => s_.id === s.id)
          })
        },
      })
      setRunning(true)
      renderer.current.addEventListener('state.end', updater)
      renderer.current.addEventListener('log.add', handler)
      renderer.current.addEventListener('log.clear', clearHandler)
      renderer.current.addEventListener('ship.selection', onSelectShip)
      return () => {
        renderer.current?.removeEventListener('state.end', updater)
        renderer.current?.removeEventListener('log.add', handler)
        renderer.current?.removeEventListener('log.clear', clearHandler)
        renderer.current?.removeEventListener('ship.selection', onSelectShip)
        renderer.current?.unmount()
      }
    }
  }, [engine, opts])
  return (
    <div className={styles.fullHeight} ref={div}>
      <Logger.Render logs={logs} />
      {ship && <RenderShip ship={ship} />}
      {running && <Pause state={pausedState} onClick={updater} />}
      <canvas
        ref={canvas}
        className={styles.canvas}
        style={{ background: `url(${backgroundTile})` }}
      />
    </div>
  )
}
