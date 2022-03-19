import * as PIXI from 'pixi.js'
import { engine, helpers } from '@svb-41/engine'
import * as svb from '@svb-41/core'
import {
  sprites,
  getBulletSprite,
  spritesSheets,
  colorSprite,
  shipSprite,
} from '@/renderer/sprites'

const { dist2 } = svb.geometry

const STANDARD_ANIMATED_SPEED = 0.075
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

const computeRotation = (rotation: number) => -rotation + Math.PI / 2

type Info = { team?: string; size: number; shipClass?: engine.ship.SHIP_CLASS }
enum Type {
  SHIP,
  BULLET,
}

const selectTexture = (app: PIXI.Application, type: Type, sprite: Info) => {
  if (type === Type.SHIP && sprite) {
    return app.loader.resources[colorSprite(sprite.team!)].textures![
      shipSprite({ ship: sprite.shipClass!, team: sprite.team })
    ]
  } else {
    const spriteId = getBulletSprite(sprite.size)
    return app.loader.resources[spriteId].texture
  }
}

export class Engine extends EventTarget {
  #app: PIXI.Application
  #engine: engine.Engine
  #animateds: Map<string, PIXI.AnimatedSprite>
  #sprites: Map<string, PIXI.Sprite>
  #ended: boolean
  #paused: boolean
  #speed: number
  #scale: number
  #pos: { x: number; y: number }
  #dragStart: { x: number; y: number }
  #drag: boolean
  #downTS: number

  constructor(
    canvas: HTMLCanvasElement,
    div: HTMLElement,
    engine: engine.Engine
  ) {
    super()
    helpers.console.log('=> [RendererEngine] Start Engine')
    const view = canvas
    const antialias = true
    this.#scale = 1
    this.#pos = { x: 0, y: 0 }
    this.#dragStart = { x: 0, y: 0 }
    this.#downTS = Date.now()
    this.#drag = false
    this.#sprites = new Map()
    this.#animateds = new Map()
    this.#engine = engine
    this.#ended = false
    this.#paused = false
    this.#speed = helpers.settings.getInitialSpeed()
    this.#app = new PIXI.Application({ view, antialias, resizeTo: div })
    const { scroll, onClick, onDragMove, onDragEnd, onDragStart } =
      this.moveFunctions()
    this.#app.view.addEventListener('wheel', scroll)
    this.#app.view.addEventListener('mouseup', onClick)
    this.#app.view.addEventListener('mousemove', onDragMove)
    this.#app.view.addEventListener('mousedown', onDragStart)
    this.#app.view.addEventListener('touchstart', onDragStart)
    this.#app.view.addEventListener('mouseup', onDragEnd)
    this.#app.view.addEventListener('touchend', onDragEnd)
    this.#app.view.addEventListener('mousemove', onDragMove)
    this.#app.view.addEventListener('touchmove', onDragMove)
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
    const resources = Object.values(this.#app.loader?.resources ?? {})
    resources.forEach(resource => {
      resource.texture?.destroy(true)
      Object.values(resource.textures ?? {}).forEach(t => t.destroy(true))
    })
    this.#app.ticker.remove(this.run)
    this.#app.destroy()
  }

  private moveFunctions() {
    return {
      onClick: (e: any) => {
        if (Date.now() - this.#downTS < 200) {
          const { offsetX: x, offsetY: y } = e
          const scale = this.#scale
          const pos = {
            x: Math.floor(x / scale - this.#pos.x),
            y: this.computeY(Math.floor(y / scale - this.#pos.y)),
          }
          const selectedShip = this.#engine.state.ships.find(
            s =>
              dist2(s.position, { pos, direction: 0, speed: 0 }) <
              Math.pow(s.stats.size, 2)
          )
          console.log(pos, selectedShip)
        }
      },
      onDragEnd: (e: any) => (this.#drag = false),
      onDragMove: (e: any) => {
        if (this.#drag) {
          const { x, y } = e
          const scale = this.#scale
          const pos = this.#pos
          this.#pos = {
            x: (x - this.#dragStart.x) / scale + pos.x,
            y: (y - this.#dragStart.y) / scale + pos.y,
          }
          this.#dragStart = { x, y }
        }
      },
      onDragStart: (e: any) => {
        const { x, y } = e
        this.#dragStart = { x, y }
        this.#drag = true
        this.#downTS = Date.now()
      },
      scroll: (e: any) => {
        const { offsetX, offsetY, deltaY } = e
        const zoomFactor = 0.96
        if (this.#scale > 0.5 || deltaY < 0) {
          const factor = deltaY > 0 ? zoomFactor : 1 / zoomFactor
          this.#scale = this.#scale * factor
          const dx = (offsetX / this.#scale) * (factor - 1)
          const dy = (offsetY / this.#scale) * (factor - 1)
          this.#pos = {
            x: this.#pos.x - dx,
            y: this.#pos.y - dy,
          }
        }
      },
    }
  }

  private computeY(y: number) {
    return -y + this.#app.screen.height
  }

  private updateSprite(
    type: Type,
    id: string,
    position: engine.ship.Position,
    sprite: Info
  ) {
    if (this.#sprites.has(id)) {
      const existing = this.#sprites.get(id)!
      existing.x = position.pos.x + this.#pos.x
      existing.y = this.computeY(position.pos.y) + this.#pos.y
      existing.rotation = computeRotation(position.direction)
    } else {
      const texture = selectTexture(this.#app, type, sprite)
      const sprite_ = new PIXI.Sprite(texture)
      const y = this.computeY(position.pos.y)
      sprite_.position.set(position.pos.x + this.#pos.x, y + this.#pos.y)
      sprite_.anchor.set(0.5, 0.5)
      sprite_.rotation = computeRotation(position.direction)
      this.#app.stage.addChild(sprite_)
      this.#sprites.set(id, sprite_)
    }
  }

  private updateDisplay() {
    this.#engine.state.ships.forEach(ship => {
      const { id, position, team, stats, shipClass } = ship
      const size = stats.size
      this.updateSprite(Type.SHIP, id, position, { team, size, shipClass })
    })
    this.#engine.state.bullets.forEach(bullet => {
      const { id, position, stats } = bullet
      const size = stats.size
      this.updateSprite(Type.BULLET, id, position, { size })
    })
  }

  private run = (deltaTime: number) => {
    if (!this.#ended) {
      this.#app.stage.scale.set(this.#scale, this.#scale)
      if (!this.#paused)
        for (let i = 0; i < this.#speed; i++) this.#engine.step(deltaTime)
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
    type OnSpriteExplosion = {
      ship: engine.ship.Ship
      bullet: engine.ship.Bullet
    }
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
      this.#paused = true
    } else {
      helpers.console.log('=> [RendererEngine] Resume the game')
      this.#animateds.forEach(sprite => sprite.play())
      this.#paused = false
    }
  }

  private onLog = (event: Event) => {
    helpers.console.log(event)
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
    this.#speed = evt.detail
    this.#animateds.forEach(this.computeAnimationSpeed)
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
    this.computeAnimationSpeed(sprite)
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

  private async loadSpriteSheets() {
    for (const { url, name } of spritesSheets) {
      await new Promise(r => this.#app.loader?.add(name, url).load(r))
    }
  }

  private async preload() {
    helpers.console.log('=> [RendererEngine] Preload assets')
    await this.loadSprites()
    await this.loadSpriteSheets()
    // const background = this.#app.loader?.resources?.background?.texture
    // if (background) {
    //   const width = window.innerWidth
    //   const height = window.innerHeight
    //   const back = new PIXI.TilingSprite(background, width, height)
    //   this.#app.stage.addChild(back)
    // }
    this.updateDisplay()
  }

  // helpers

  private computeAnimationSpeed = (sprite: PIXI.AnimatedSprite) => {
    const newSpeed = STANDARD_ANIMATED_SPEED * this.#speed
    sprite.animationSpeed = newSpeed
  }
}
