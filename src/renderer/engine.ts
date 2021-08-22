import * as PIXI from 'pixi.js'
import { Engine as GameEngine, State } from '@/engine'
import * as helpers from '@/helpers'
import { sprites, getSprite } from '@/renderer/sprites'

const computeRotation = (rotation: number) => rotation + Math.PI / 2

export class Engine {
  #app: PIXI.Application
  #engine: GameEngine
  #ships: { [id: string]: PIXI.Sprite }
  #bullets: { [id: string]: PIXI.Sprite }

  constructor(canvas: HTMLCanvasElement, engine: GameEngine) {
    helpers.console.log('=> [RendererEngine] Start Engine')
    const view = canvas
    const antialias = true
    this.#ships = {}
    this.#bullets = {}
    this.#engine = engine
    this.#app = new PIXI.Application({ view, antialias, resizeTo: window })
    this.preload().then(async () => {
      this.#app.ticker.add(this.run)
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

  private updateDisplay(state: State) {
    state.ships.forEach(ship => {
      const { id, position } = ship
      this.#ships[id].x = position.pos.x
      this.#ships[id].y = position.pos.y
      this.#ships[id].rotation = computeRotation(position.direction)
    })

    Object.entries(this.#bullets)
      .filter(([id, _value]) => !state.bullets.find(b => b.id === id))
      .forEach(([id, sprite]) => {
        sprite.destroy()
        delete this.#bullets[id]
      })

    state.bullets.forEach(bullet => {
      const { id, position } = bullet
      if (this.#bullets[id]) {
        this.#bullets[id].x = position.pos.x
        this.#bullets[id].y = position.pos.y
        this.#bullets[id].rotation = computeRotation(position.direction)
      } else {
        const sprite = new PIXI.Sprite(
          this.#app.loader.resources.bullet.texture
        )
        sprite.position.set(bullet.position.pos.x, bullet.position.pos.y)
        sprite.anchor.set(0.5, 0.5)
        sprite.rotation = computeRotation(bullet.position.direction)
        this.#app.stage.addChild(sprite)
        this.#bullets[bullet.id] = sprite
      }
    })
  }

  private run = (deltaTime: number) => {
    const state = this.#engine.step(deltaTime)
    this.updateDisplay(state)
  }

  private async preload() {
    helpers.console.log('=> [RendererEngine] Preload assets')

    for (const { url, name } of sprites) {
      await new Promise(r => this.#app.loader.add(name, url).load(r))
    }

    this.#engine.state.ships.forEach(ship => {
      const sprite = new PIXI.Sprite(
        this.#app.loader.resources[getSprite(ship)].texture
      )

      sprite.position.set(ship.position.pos.x, ship.position.pos.y)
      sprite.anchor.set(0.5, 0.5)
      sprite.rotation = computeRotation(ship.position.direction)
      this.#app.stage.addChild(sprite)
      this.#ships[ship.id] = sprite
    })

    this.#engine.state.bullets.forEach(bullet => {
      const sprite = new PIXI.Sprite(this.#app.loader.resources.bullet.texture)
      sprite.position.set(bullet.position.pos.x, bullet.position.pos.y)
      sprite.anchor.set(0.5, 0.5)
      sprite.rotation = computeRotation(bullet.position.direction)
      this.#app.stage.addChild(sprite)
      this.#bullets[bullet.id] = sprite
    })
  }
}
