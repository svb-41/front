import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import * as Controller from '@/canvas/Controller'
import styles from '@/App.module.css'

const log = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}

class GameEngine {
  #app: PIXI.Application
  #ship: PIXI.Sprite | undefined

  constructor(canvas: HTMLCanvasElement) {
    log('=> [GameEngine] Start Engine')
    const view = canvas
    const antialias = true
    this.#app = new PIXI.Application({ view, antialias, resizeTo: window })
    this.preload().then(async () => {
      this.#app.ticker.add(this.run)
    })
  }

  run(_deltaTime: number) {}

  async preload() {
    log('=> [GameEngine] Preload assets')
    const url = '/assets/Ships/ship_0000.png'
    await new Promise(r => this.#app.loader.add('ship', url).load(r))
    this.#ship = new PIXI.Sprite(this.#app.loader.resources.ship.texture)
    this.#ship.position.set(
      (300 + 16) % this.#app.renderer.width,
      (300 + 16) % this.#app.renderer.height
    )
    this.#ship.anchor.set(0.5, 0.5)
    this.#app.stage.addChild(this.#ship)
  }

  unmount() {
    log('=> [GameEngine] Unmount and clear')
    for (const resource of Object.values(this.#app.loader.resources)) {
      resource.texture?.destroy()
      PIXI.BaseTexture.removeFromCache(resource.name)
      PIXI.BaseTexture.removeFromCache(resource.url)
    }
    this.#app.ticker.remove(this.run)
    this.#app.destroy()
  }
}

export const App = () => {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    console.log('run')
    if (canvas.current) {
      const engine = new GameEngine(canvas.current)
      return () => engine.unmount()
    }
  }, [])
  return (
    <div>
      <Controller.Overlay.Render />
      <canvas ref={canvas} className={styles.canvas} />
    </div>
  )
}
