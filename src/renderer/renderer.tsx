import { useEffect, useRef, Fragment } from 'react'
import * as PIXI from 'pixi.js'
import * as Controller from '@/renderer/controller'
import styles from '@/renderer/renderer.module.css'
import * as helpers from '@/helpers'
import { State } from '@/engine'

class GameEngine {
  #app: PIXI.Application
  #state: State
  #ships: { [id: string]: PIXI.Sprite }

  computeRotation(rotation: number) {
    return rotation - Math.PI / 2
  }

  constructor(canvas: HTMLCanvasElement, state: State) {
    helpers.console.log('=> [GameEngine] Start Engine')
    const view = canvas
    const antialias = true
    this.#ships = {}
    this.#state = state
    this.#app = new PIXI.Application({ view, antialias, resizeTo: window })
    this.preload().then(async () => {
      this.#app.ticker.add(this.run)
    })
  }

  run(_deltaTime: number) {}

  async preload() {
    helpers.console.log('=> [GameEngine] Preload assets')
    const url = '/assets/Ships/ship_0000.png'
    await new Promise(r => this.#app.loader.add('ship', url).load(r))
    this.#state.ships.forEach(ship => {
      const sprite = new PIXI.Sprite(this.#app.loader.resources.ship.texture)
      sprite.position.set(ship.position.pos.x, ship.position.pos.y)
      sprite.anchor.set(0.5, 0.5)
      sprite.rotation = this.computeRotation(ship.position.direction)
      this.#app.stage.addChild(sprite)
      this.#ships[ship.id] = sprite
    })
  }

  unmount() {
    helpers.console.log('=> [GameEngine] Unmount and clear')
    for (const resource of Object.values(this.#app.loader.resources)) {
      resource.texture?.destroy()
      PIXI.BaseTexture.removeFromCache(resource.name)
      PIXI.BaseTexture.removeFromCache(resource.url)
    }
    this.#app.ticker.remove(this.run)
    this.#app.destroy()
  }
}

export type Props = { state: State }
export const Renderer = ({ state }: Props) => {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    helpers.console.log('run')
    if (canvas.current) {
      const engine = new GameEngine(canvas.current, state)
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
