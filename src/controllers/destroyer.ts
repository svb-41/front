import * as svb from '@svb-41/core'
const { dist2 } = svb.geometry

type Position = svb.ship.Position
type Data = { target?: Position }

const weaponType = (stats: svb.ship.Ship) => {
  const weapon = stats.weapons
    .map((w, i) => ({ w, i }))
    .find(({ w }) => w.coolDown === 0 && w.amo > 0)
  if (weapon) return weapon.i
  return 0
}

export const data: Data = {}
export const ai: svb.AI<Data> = ({ stats, radar, memory, ship, comm }) => {
  const messages = comm.messagesSince(0)
  const weapon = weaponType(stats)
  const isTorpedo = stats.weapons[weapon].bullet.stats.acceleration > 0
  const near = svb.radar.nearestEnemy(radar, stats.team, stats.position)
  if (near && !memory.target) memory.target = near.enemy.position
  if (messages.length > 0 && !memory.target) {
    const targets: Array<Position> = messages.flatMap(m =>
      m.content.message.map((res: any) => res)
    )
    const dists = targets.sort((p1, p2) =>
      svb.geometry.dist2(p1, stats.position) >
      svb.geometry.dist2(p2, stats.position)
        ? -1
        : 1
    )
    memory.target = dists.pop()
  }

  if (memory.target) {
    const speed = stats.weapons[weapon].bullet.position.speed
    const delay = Math.floor(
      Math.sqrt(svb.geometry.dist2(stats.position, memory.target)) / speed === 0
        ? 0.6
        : speed
    )
    const target = svb.geometry.nextPosition(delay)(memory.target)
    if (isTorpedo) {
      const d = Math.sqrt(dist2(stats.position, target))
      memory.target = undefined
      return ship.fire(weapon, { target: target.pos, armedTime: d - 100 })
    }

    const resAim = svb.geometry.aim({
      ship,
      source: stats.position,
      target,
      weapon,
      delay,
    })
    if (resAim.id === svb.Instruction.FIRE) memory.target = undefined
    return resAim
  }

  return ship.idle()
}
