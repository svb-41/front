import { engine } from '@svb-41/engine'

type Ship = engine.ship.Ship
type SHIP_CLASS = engine.ship.SHIP_CLASS
type BuildShipProps = engine.config.builder.BuildShipProps

const { SHIP_CLASS } = engine.ship
const {
  buildFighter,
  buildStealth,
  buildDestroyer,
  buildCruiser,
  buildBomber,
  buildScout,
  buildBase,
} = engine.config.builder

const builders: Array<{
  id: SHIP_CLASS
  builder: (props: BuildShipProps) => Promise<Ship>
}> = [
  { id: SHIP_CLASS.FIGHTER, builder: buildFighter },
  { id: SHIP_CLASS.STEALTH, builder: buildStealth },
  { id: SHIP_CLASS.DESTROYER, builder: buildDestroyer },
  { id: SHIP_CLASS.CRUISER, builder: buildCruiser },
  { id: SHIP_CLASS.BOMBER, builder: buildBomber },
  { id: SHIP_CLASS.SCOUT, builder: buildScout },
  { id: SHIP_CLASS.BASE, builder: buildBase },
]

export const findBuilder = (id: string) =>
  builders.find(builder => builder.id === id) ?? {
    id: SHIP_CLASS.FIGHTER,
    builder: buildFighter,
  }
