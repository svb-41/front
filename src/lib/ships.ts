import { Mission } from '@/services/mission'
import { Color } from '@/lib/color'

export const ships = [
  'fighter',
  'scout',
  'cruiser',
  'stealth',
  'bomber',
  'destroyer',
]

const shipsLoad: any = {}
const colors = Object.values(Color)
await Promise.all(
  ships.map(ship => {
    return Promise.all(
      colors.map(async color => {
        const shipName = `${ship.toLowerCase()}-${color}`
        const path = await import(
          /* @vite-ignore */
          `../../assets/Tiles/${shipName}.png`
        )
        const file = path.default
        const img = new Image()
        const prom = new Promise(resolve => (img.onload = resolve))
        img.src = file
        await prom
        shipsLoad[shipName] = file
      })
    )
  })
)

export const getImage = (ship: string, color: string) => {
  const shipName = `${ship.toLowerCase()}-${color}`
  return shipsLoad[shipName]
}

export const countShips = (mission: Mission) => {
  return mission.ships.reduce((acc, val) => {
    const n = val.classShip
    return { ...acc, [n]: (acc[n] ?? 0) + 1 }
  }, {} as { [key: string]: number })
}
