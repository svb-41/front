import {
  buildFighter,
  buildStealth,
  buildDestroyer,
  buildCruiser,
  buildBomber,
  buildScout,
  BuildShipProps,
} from '@/engine/config/builder'
import { SHIP_CLASS, Ship } from '@/engine/ship'

const builders: Array<{
  id: SHIP_CLASS
  builder: (props: BuildShipProps) => Ship
}> = [
  { id: SHIP_CLASS.FIGHTER, builder: buildFighter },
  { id: SHIP_CLASS.STEALTH, builder: buildStealth },
  { id: SHIP_CLASS.DESTROYER, builder: buildDestroyer },
  { id: SHIP_CLASS.CRUISER, builder: buildCruiser },
  { id: SHIP_CLASS.BOMBER, builder: buildBomber },
  { id: SHIP_CLASS.SCOUT, builder: buildScout },
]

export const findBuilder = (id: string) =>
  builders.find(builder => builder.id === id)
