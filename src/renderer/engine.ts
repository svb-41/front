import * as PIXI from 'pixi.js'
import { State } from '@/engine'
import * as helpers from '@/helpers'

export class Engine {
  #app: PIXI.Application
  #state: State
  #ships: { [id: string]: PIXI.Sprite }

  computeRotation(rotation: number) {
    return rotation - Math.PI / 2
  }

  constructor(canvas: HTMLCanvasElement, state: State) {
    helpers.console.log('=> [RendererEngine] Start Engine')
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
    helpers.console.log('=> [RendererEngine] Preload assets')
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
    helpers.console.log('=> [RendererEngine] Unmount and clear')
    for (const resource of Object.values(this.#app.loader.resources)) {
      resource.texture?.destroy()
      PIXI.BaseTexture.removeFromCache(resource.name)
      PIXI.BaseTexture.removeFromCache(resource.url)
    }
    this.#app.ticker.remove(this.run)
    this.#app.destroy()
  }
}
