import { useEffect, useRef, Fragment } from 'react'
import { Engine as GameEngine } from '@/engine'
import * as helpers from '@/helpers'
import * as Controller from '@/renderer/controller'
import { Engine } from '@/renderer/engine'
import styles from '@/renderer/react/renderer.module.css'

export type Props = { engine: GameEngine }
export const Renderer = ({ engine }: Props) => {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    helpers.console.log('run')
    if (canvas.current) {
      const renderer = new Engine(canvas.current, engine)
      return () => renderer.unmount()
    }
  }, [engine])
  return (
    <Fragment>
      <Controller.Overlay.Render />
      <canvas ref={canvas} className={styles.canvas} />
    </Fragment>
  )
}
