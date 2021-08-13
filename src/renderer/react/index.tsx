import { useEffect, useRef, Fragment } from 'react'
import { State } from '@/engine'
import * as helpers from '@/helpers'
import * as Controller from '@/renderer/controller'
import { Engine } from '@/renderer/engine'
import styles from '@/renderer/react/renderer.module.css'

export type Props = { state: State }
export const Renderer = ({ state }: Props) => {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    helpers.console.log('run')
    if (canvas.current) {
      const engine = new Engine(canvas.current, state)
      return () => engine.unmount()
    }
  }, [state])
  return (
    <Fragment>
      <Controller.Overlay.Render />
      <canvas ref={canvas} className={styles.canvas} />
    </Fragment>
  )
}
