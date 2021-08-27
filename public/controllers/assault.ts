import { Controller, ControllerArgs } from 'starships'
import { Ship, RadarResult, dist2 } from 'starships'
import * as helpers from 'starships'

type Data = { turn: boolean }
const assault = (ship: Ship): Controller<Data> => {
  const shipId = ship.id
  const getInstruction = (args: ControllerArgs<Data>) => {
    const { stats, radar, memory, ship } = args
    if (stats.stats.size === 8) {
      if (memory.turn) {
        memory.turn = false
        return Math.random() > 0.5 ? ship.turnLeft() : ship.turnRight()
      }
      if (stats.position.speed < 0.1) {
        return ship.thrust()
      }
    } else {
      if (stats.position.speed < 0.1) {
        return ship.thrust()
      }
    }

    const ally = radar.find((res: RadarResult) => {
      const isSameTeam = res.team === stats.team
      return (
        isSameTeam &&
        Math.abs(
          helpers.trigo.angle({
            source: stats.position,
            target: helpers.trigo.nextPosition(200)(res.position),
          }) - stats.position.direction
        ) < 0.1
      )
    })

    const closeEnemy = radar
      .filter((res: RadarResult) => res.team !== stats.team && !res.destroyed)
      .map((res: RadarResult) => {
        const dist = dist2(res.position, stats.position)
        return { res, dist }
      })
    if (closeEnemy.length > 0) {
      const nearestEnemy = closeEnemy.reduce((acc, val) => {
        return acc.dist > val.dist ? val : acc
      })

      const speed = stats.weapons[0]?.bullet?.position?.speed ?? 1
      const delay = Math.sqrt(nearestEnemy.dist) / speed
      const resAim = helpers.trigo.aim({
        ship,
        source: stats.position,
        target: nearestEnemy.res.position,
        threshold: 1 / Math.sqrt(nearestEnemy.dist),
        delay,
      })
      if (resAim.constructor.name === 'Fire' && ally) return ship.idle()
      return resAim
    }

    return ship.idle()
  }
  return new Controller<Data>(shipId, getInstruction, { turn: false })
}

export default assault
