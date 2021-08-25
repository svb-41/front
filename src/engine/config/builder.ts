import { v4 as uuid } from 'uuid'
import { MOTHER_SHIP, BASIC_BASE, BASIC_SHIP } from './ship'
import { Ship } from '@/engine/ship'

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
