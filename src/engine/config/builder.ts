import { v4 as uuid } from 'uuid'
import { MOTHER_SHIP, BASIC_BASE, BASIC_SHIP } from './ship'
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
export const buildBasicShip = ({
  position = { pos: { x: 0, y: 0 }, direction: 0 },
  team = 'none',
}: BuildShipProps): Ship => ({
  ...BASIC_SHIP,
  id: uuid(),
  weapons: BASIC_SHIP.weapons.map(w => ({ ...w })),
  position: { ...BASIC_SHIP.position, ...position },
  team,
})

export const buildMotherShip = ({
  position = { pos: { x: 0, y: 0 }, direction: 0 },
  team = 'none',
}: BuildShipProps): Ship => ({
  ...MOTHER_SHIP,
  id: uuid(),
  position: { ...MOTHER_SHIP.position, ...position },
  weapons: MOTHER_SHIP.weapons.map(w => ({ ...w })),
  team,
})

export const buildBasicBase = ({
  position = { pos: { x: 0, y: 0 }, direction: 0 },
  team = 'none',
}: BuildShipProps): Ship => ({
  ...BASIC_BASE,
  id: uuid(),
  weapons: BASIC_BASE.weapons.map(w => ({ ...w })),
  position: { ...BASIC_BASE.position, ...position },
  team,
})

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
