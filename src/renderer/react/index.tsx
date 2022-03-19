import { useEffect, useRef, useState } from 'react'
import { engine, helpers } from '@svb-41/engine'
import { Details } from '@/components/ship'
import * as Logger from '@/renderer/logger'
import { Engine } from '@/renderer/engine'
import styles from '@/renderer/react/renderer.module.css'

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
  const text = state === 'paused' ? 'Resume' : 'Pause'
  const background = state === 'resumed' ? 'var(--ts-blue)' : 'var(--green)'
  return (
    <button className={styles.pause} style={{ background }} onClick={onClick}>
      {text}
    </button>
  )
}

const RenderShip = ({ ship }: { ship: engine.ship.Ship }) => (
  <div className={styles.renderShip}>
    <Details
      ship={ship.shipClass}
      color={ship.team}
      infoCard="var(--ddd)"
      locked={false}
    />
  </div>
)

export type Props = { engine: engine.Engine }
export const Renderer = ({ engine }: Props) => {
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
      renderer.current = new Engine(canvas.current, div.current, engine)
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
  }, [engine])
  return (
    <div className={styles.fullHeight} ref={div}>
      <Logger.Render logs={logs} />
      {ship && <RenderShip ship={ship} />}
      {running && <Pause state={pausedState} onClick={updater} />}
      <canvas ref={canvas} className={styles.canvas} />
    </div>
  )
}
