import * as PIXI from 'pixi.js'
import { Engine as GameEngine } from '@/engine'
import * as helpers from '@/helpers'
import { sprites, getSprite, getBulletSprite } from '@/renderer/sprites'
import * as ship from '@/engine/ship'

const STANDARD_ANIMATED_SPEED = 0.075

const computeRotation = (rotation: number) => -rotation + Math.PI / 2

type Info = { team?: string; size: number }
enum Type {
  SHIP,
  BULLET,
}

const selectTexture = (app: PIXI.Application, type: Type, sprite: Info) => {
  if (type === Type.SHIP && sprite) {
    const spriteId = getSprite(sprite.team!, sprite.size)
    return app.loader.resources[spriteId].texture
  } else {
    const spriteId = getBulletSprite(sprite.size)
    return app.loader.resources[spriteId].texture
  }
}

export class Engine extends EventTarget {
  #app: PIXI.Application
  #engine: GameEngine
  #animateds: Map<string, PIXI.AnimatedSprite>
  #sprites: Map<string, PIXI.Sprite>
  #ended: boolean
  #speed: number

  constructor(canvas: HTMLCanvasElement, div: HTMLElement, engine: GameEngine) {
    super()
    helpers.console.log('=> [RendererEngine] Start Engine')
    const view = canvas
    const antialias = true
    this.#sprites = new Map()
    this.#animateds = new Map()
    this.#engine = engine
    this.#ended = false
    this.#speed = helpers.settings.getInitialSpeed()
    this.#app = new PIXI.Application({ view, antialias, resizeTo: div })
    this.#engine.addEventListener('sprite.remove', this.onSpriteRemove)
    this.#engine.addEventListener('sprite.explosion', this.onSpriteExplosion)
    this.#engine.addEventListener('log.add', this.onLog)
    this.#engine.addEventListener('log.clear', this.onClear)
    this.#engine.addEventListener('state.end', this.onEnd)
    this.addEventListener('state.pause', this.onStatePause)
    this.addEventListener('state.speed', this.onSpeed)
    this.preload().then(async () => {
      this.#app.ticker.add(this.run)
    })
  }

  unmount() {
    helpers.console.log('=> [RendererEngine] Unmount and clear')
    this.#engine.removeEventListener('sprite.remove', this.onSpriteRemove)
    this.#engine.removeEventListener('sprite.explosion', this.onSpriteExplosion)
    this.#engine.removeEventListener('log.add', this.onLog)
    this.#engine.removeEventListener('log.clear', this.onClear)
    this.#engine.removeEventListener('state.end', this.onEnd)
    this.removeEventListener('state.pause', this.onStatePause)
    this.removeEventListener('state.speed', this.onSpeed)
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

  private updateSprite(
    type: Type,
    id: string,
    position: ship.Position,
    sprite: Info
  ) {
    if (this.#sprites.has(id)) {
      const existing = this.#sprites.get(id)!
      existing.x = position.pos.x
      existing.y = this.computeY(position.pos.y)
      existing.rotation = computeRotation(position.direction)
    } else {
      const texture = selectTexture(this.#app, type, sprite)
      const sprite_ = new PIXI.Sprite(texture)
      const y = this.computeY(position.pos.y)
      sprite_.position.set(position.pos.x, y)
      sprite_.anchor.set(0.5, 0.5)
      sprite_.rotation = computeRotation(position.direction)
      this.#app.stage.addChild(sprite_)
      this.#sprites.set(id, sprite_)
    }
  }

  private updateDisplay() {
    this.#engine.state.ships.forEach(ship => {
      const { id, position, team, stats } = ship
      const size = stats.size
      this.updateSprite(Type.SHIP, id, position, { team, size })
    })
    this.#engine.state.bullets.forEach(bullet => {
      const { id, position, stats } = bullet
      const size = stats.size
      this.updateSprite(Type.BULLET, id, position, { size })
    })
  }

  private run = (deltaTime: number) => {
    if (!this.#ended) {
      for (let i = 0; i < this.#speed; i++) {
        this.#engine.step(deltaTime)
      }
      this.updateDisplay()
    } else {
      this.#app.ticker.remove(this.run)
    }
  }

  // Event Listeners

  private onSpriteRemove = (event: Event) => {
    const evt = event as CustomEvent
    const ids: string[] = evt.detail
    ids.forEach(id => {
      this.#sprites.get(id)?.destroy()
      this.#sprites.delete(id)
    })
  }

  private onSpriteExplosion = (event: Event) => {
    type OnSpriteExplosion = { ship: ship.Ship; bullet: ship.Bullet }
    const evt = event as CustomEvent<OnSpriteExplosion>
    const ship = this.#sprites.get(evt.detail.ship.id)
    if (ship) {
      const id = `${evt.detail.ship.id}/${evt.detail.bullet.id}`
      const sprite = this.createExplosion(id, ship)
      this.#animateds.set(id, sprite)
      this.#app.stage.addChild(sprite)
      sprite.play()
      if (evt.detail.ship.destroyed) {
        const filter = new PIXI.filters.ColorMatrixFilter()
        filter.brightness(0.4, true)
        ship.filters = [filter]
      }
    }
  }

  private onEnd = (_event: Event) => {
    helpers.console.log('=> [RendererEngine] End the game')
    this.#ended = true
    this.dispatchEvent(new Event('state.end'))
  }

  private onStatePause = (event: Event) => {
    const evt = event as CustomEvent
    if (evt.detail.paused) {
      helpers.console.log('=> [RendererEngine] Pause the game')
      this.#animateds.forEach(sprite => sprite.stop())
      this.#app.ticker.stop()
    } else {
      helpers.console.log('=> [RendererEngine] Resume the game')
      this.#animateds.forEach(sprite => sprite.play())
      this.#app.ticker.start()
    }
  }

  private onLog = (event: Event) => {
    console.log(event)
    const evt = event as CustomEvent
    const { detail } = evt
    this.dispatchEvent(new CustomEvent('log.add', { detail }))
  }

  private onClear = (_event: Event) => {
    this.dispatchEvent(new Event('log.clear'))
  }

  private onSpeed = (event: Event) => {
    const evt = event as CustomEvent<number>
    helpers.settings.setInitialSpeed(evt.detail)
    const speed = evt.detail
    this.#speed = speed
    const newSpeed = STANDARD_ANIMATED_SPEED * speed
    this.#animateds.forEach(sprite => (sprite.animationSpeed = newSpeed))
  }

  // Sprites

  private createExplosion(id: string, ship: PIXI.Sprite) {
    const textures = [
      this.#app.loader.resources.explosion1.texture!,
      this.#app.loader.resources.explosion2.texture!,
      this.#app.loader.resources.explosion3.texture!,
      this.#app.loader.resources.explosion4.texture!,
      this.#app.loader.resources.explosion5.texture!,
    ]
    const sprite = new PIXI.AnimatedSprite(textures)
    sprite.loop = false
    sprite.animationSpeed = STANDARD_ANIMATED_SPEED * this.#speed
    sprite.anchor.set(0.5, 0.5)
    sprite.onComplete = () => {
      sprite.destroy()
      this.#animateds.delete(id)
    }
    sprite.x = ship.x
    sprite.y = ship.y
    return sprite
  }

  private async loadSprites() {
    for (const { url, name } of sprites) {
      await new Promise(r => this.#app.loader?.add(name, url).load(r))
    }
  }

  private async preload() {
    helpers.console.log('=> [RendererEngine] Preload assets')
    await this.loadSprites()
    const background = this.#app.loader?.resources?.background?.texture
    if (background) {
      const width = window.innerWidth
      const height = window.innerHeight
      const back = new PIXI.TilingSprite(background, width, height)
      this.#app.stage.addChild(back)
    }
    this.updateDisplay()
  }
}
