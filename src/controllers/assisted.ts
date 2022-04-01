import * as svb from '@svb-41/core'

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
  const nearestEnemy = svb.radar.nearestEnemy(radar, stats.team, stats.position)
  if (nearestEnemy) memory.target = nearestEnemy.enemy.position
  if (!memory.target && messages.length > 0)
    memory.target = messages
      .flatMap(m => m.content.message.map((res: any) => res))
      .find(p => svb.geometry.dist(p, stats.position))

  const weapon = weaponType(stats)
  if (memory.target) {
    const target = svb.geometry.nextPosition(200)(memory.target)
    const resAim = svb.geometry.aim({
      ship,
      source: stats.position,
      target,
      weapon,
    })

    if (
      resAim.id === svb.Instruction.FIRE &&
      stats.weapons[weapon].coolDown === 0
    )
      memory.target = undefined
    return resAim
  }

  return ship.idle()
}
