import * as PIXI from 'pixi.js'
import { Engine as GameEngine } from '@/engine'
import * as helpers from '@/helpers'
import { sprites, getSprite } from '@/renderer/sprites'
import * as ship from '@/engine/ship'

type SpriteInfo = {
  team: string
  size: number
}

const computeRotation = (rotation: number) => -rotation + Math.PI / 2

enum SpriteType {
  SHIP,
  BULLET,
}

const selectTexture = (
  app: PIXI.Application,
  type: SpriteType,
  sprite?: SpriteInfo
) => {
  if (type === SpriteType.SHIP && sprite) {
    const spriteId = getSprite(sprite.team, sprite.size)
    return app.loader.resources[spriteId].texture
  } else {
    return app.loader.resources.bullet.texture
  }
}

export class Engine {
  #app: PIXI.Application
  #engine: GameEngine
  #sprites: { [id: string]: PIXI.Sprite }
  #ended: boolean

  constructor(canvas: HTMLCanvasElement, engine: GameEngine) {
    helpers.console.log('=> [RendererEngine] Start Engine')
    const view = canvas
    const antialias = true
    this.#sprites = {}
    this.#engine = engine
    this.#ended = false
    this.#app = new PIXI.Application({ view, antialias, resizeTo: window })
    this.#engine.addEventListener('end', this.onEnd)
    this.#engine.addEventListener('onSpriteRemove', this.onSpriteRemove)
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

  private computeY(y: number) {
    return -y + this.#app.screen.height
  }

  private onEnd = (_event: Event) => {
    this.#ended = true
    console.log('=> [RendererEngine] End the game')
  }

  private updateSprite(
    type: SpriteType,
    id: string,
    position: ship.Position,
    sprite?: SpriteInfo
  ) {
    if (this.#sprites[id]) {
      this.#sprites[id].x = position.pos.x
      this.#sprites[id].y = this.computeY(position.pos.y)
      this.#sprites[id].rotation = computeRotation(position.direction)
    } else {
      const texture = selectTexture(this.#app, type, sprite)
      const sprite_ = new PIXI.Sprite(texture)
      const y = this.computeY(position.pos.y)
      sprite_.position.set(position.pos.x, y)
      sprite_.anchor.set(0.5, 0.5)
      sprite_.rotation = computeRotation(position.direction)
      this.#app.stage.addChild(sprite_)
      this.#sprites[id] = sprite_
    }
  }

  private onSpriteRemove = (event: Event) => {
    const evt = event as CustomEvent
    const ids: string[] = evt.detail
    ids.forEach(id => {
      this.#sprites[id]?.destroy()
      delete this.#sprites[id]
    })
  }

  private updateDisplay() {
    this.#engine.state.ships.forEach(ship => {
      const { id, position, team, stats } = ship
      const size = stats.size
      this.updateSprite(SpriteType.SHIP, id, position, { team, size })
    })
    this.#engine.state.bullets.forEach(bullet => {
      const { id, position } = bullet
      this.updateSprite(SpriteType.BULLET, id, position)
    })
  }

  private run = (deltaTime: number) => {
    if (!this.#ended) {
      this.#engine.step(deltaTime)
      this.updateDisplay()
    } else {
      this.#app.ticker.remove(this.run)
    }
  }

  private async loadSprites() {
    for (const { url, name } of sprites) {
      await new Promise(r => this.#app.loader.add(name, url).load(r))
    }
  }

  private async preload() {
    helpers.console.log('=> [RendererEngine] Preload assets')
    await this.loadSprites()
    this.updateDisplay()
  }
}
