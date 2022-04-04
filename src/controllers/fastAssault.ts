import * as svb from '@svb-41/core'

type Data = { initialDir?: number }
const weaponType = (stats: svb.ship.Ship) => {
  const weapon = stats.weapons
    .map((w, i) => ({ w, i }))
    .find(({ w }) => w.coolDown === 0 && w.amo > 0)
  if (weapon) return weapon.i
  return 0
}

export const data: Data = {}
export const ai: svb.AI<Data> = ({ stats, radar, memory, ship, comm }) => {
  if (!memory.initialDir) memory.initialDir = stats.position.direction
  if (stats.position.speed < 0.6) return ship.thrust()

  const enemies = svb.radar.closeEnemies(radar, stats.team, stats.position)
  if (enemies.length > 0) comm.sendMessage(enemies.map(r => r.enemy.position))

  const ally = radar.find(res => {
    const isSameTeam = res.team === stats.team
    if (!isSameTeam) return false
    const source = stats.position
    const target = svb.geometry.nextPosition(200)(res.position)
    const finalAngle = svb.geometry.angle({ source, target })
    const direction = finalAngle - stats.position.direction
    return Math.abs(direction) < 0.1
  })

  const near = svb.radar.nearestEnemy(enemies)
  if (near) {
    const source = stats.position
    const target = near.enemy.position
    const threshold = 4 / Math.sqrt(near.dist2)
    const speed = stats.weapons[0]?.bullet.position.speed
    const delay = Math.sqrt(near.dist2) / speed
    const resAim = svb.geometry.aim({
      ship,
      source,
      target,
      threshold,
      delay,
      weapon: weaponType(stats),
    })
    if (resAim.id === svb.Instruction.FIRE && ally) return ship.idle()
    return resAim
  }

  const { direction } = stats.position
  if (memory.initialDir - direction)
    return ship.turn(memory.initialDir - direction)
  return ship.idle()
}
