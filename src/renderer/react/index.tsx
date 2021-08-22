import { useEffect, useRef, useState, Fragment } from 'react'
import { Engine as GameEngine } from '@/engine'
import * as helpers from '@/helpers'
import * as Controller from '@/renderer/controller'
import { Engine } from '@/renderer/engine'
import styles from '@/renderer/react/renderer.module.css'

const handleSpacebar = (onClick: () => void) => {
  return (event: KeyboardEvent) => {
    if (event.code === 'Space') onClick()
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
  return (
    <button className={styles.pause} onClick={onClick}>
      {text}
    </button>
  )
}

export type Props = { engine: GameEngine }
export const Renderer = ({ engine }: Props) => {
  const [pausedState, setPausedState] = useState<PausedState>('resumed')
  const [running, setRunning] = useState(false)
  const renderer = useRef<Engine | null>(null)
  const updater = () => {
    const newState = pausedState === 'paused' ? 'resumed' : 'paused'
    setPausedState(newState)
    const detail = { paused: newState === 'paused' }
    renderer.current?.dispatchEvent(new CustomEvent('pauseState', { detail }))
  }
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    helpers.console.log('=> [RendererReact] Run')
    if (canvas.current) {
      const updater = () => setRunning(false)
      renderer.current = new Engine(canvas.current, engine)
      setRunning(true)
      renderer.current.addEventListener('end', updater)
      return () => {
        renderer.current?.removeEventListener('end', updater)
        renderer.current?.unmount()
      }
    }
  }, [engine])
  return (
    <Fragment>
      <Controller.Overlay.Render />
      {running && <Pause state={pausedState} onClick={updater} />}
      <canvas ref={canvas} className={styles.canvas} />
    </Fragment>
  )
}
