import { v4 as uuid } from 'uuid'
import {
  DESTROYER,
  FIGHTER,
  STEALTH,
  CRUISER,
  BOMBER,
  SCOUT,
  // BASE,
} from './ship'
import { Ship, RadarResult, dist2 } from '@/engine/ship'
import { BulletController, BulletControllerArgs } from '@/engine/control'
import { trigo } from '@/helpers'

type BuildShipProps = {
  position?: {
    pos: { x: number; y: number }
    direction: number
  }
  team?: string
}

const buildShip =
  (blueprint: Ship) =>
  ({
    position = { pos: { x: 0, y: 0 }, direction: 0 },
    team = 'none',
  }: BuildShipProps): Ship => ({
    ...blueprint,
    id: uuid(),
    weapons: blueprint.weapons.map(w => ({ ...w })),
    position: { ...blueprint.position, ...position },
    team,
  })

export const buildFighter = buildShip(FIGHTER)
export const buildStealth = buildShip(STEALTH)
export const buildDestroyer = buildShip(DESTROYER)
export const buildCruiser = buildShip(CRUISER)
export const buildBomber = buildShip(BOMBER)
export const buildScout = buildShip(SCOUT)

type Target = { x: number; y: number }
type HomingTarget = { target: Target; armedTime: number }

const navigateTo = ({ bullet, stats, memory }: BulletControllerArgs) =>
  stats.position.speed < 0.6
    ? bullet.thrust(0.1)
    : trigo.findDirection({
        ship: bullet,
        source: stats.position,
        target: { direction: 0, speed: 0, pos: memory.target },
      })

export const buildTorpedo = (target: HomingTarget) =>
  new BulletController<HomingTarget>(navigateTo, target)

const homeTo = ({ bullet, stats, memory, radar }: BulletControllerArgs) => {
  if (stats.position.speed < 0.6) return bullet.thrust(0.1)
  memory.armedTime--
  if (memory.armedTime < 0) {
    const closeEnemy = radar
      .filter(r => !r.destroyed)
      .map((res: RadarResult) => ({
        res,
        dist: dist2(res.position, stats.position),
      }))
    if (closeEnemy.length > 0) {
      const nearestEnemy = closeEnemy.reduce((acc, val) =>
        acc.dist > val.dist ? val : acc
      )
      return trigo.findDirection({
        ship: bullet,
        source: stats.position,
        target: { direction: 0, speed: 0, pos: nearestEnemy.res.position.pos },
      })
    }
  }
  return trigo.findDirection({
    ship: bullet,
    source: stats.position,
    target: { direction: 0, speed: 0, pos: memory.target },
  })
}

export const buildHomingTorpedo = (target: HomingTarget) =>
  new BulletController<HomingTarget>(homeTo, target)
