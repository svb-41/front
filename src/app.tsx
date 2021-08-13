import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import './app.css'
import { State, INSTRUCTION } from './engine'
import { BASIC_SHIP } from './engine/config'
import { Ship, RadarResult } from './engine/ship'
import { Renderer } from '@/renderer'
import { Engine } from '@/engine'

const defaultState: State = {
  ships: new Array(100).fill(0).map(() => {
    const id = uuid()
    const x = Math.round(Math.random() * window.innerWidth)
    const y = Math.round(Math.random() * window.innerHeight)
    const pos = { x, y }
    const position = { ...BASIC_SHIP.position, pos }
    return { ...BASIC_SHIP, id, position }
  }),
  size: { height: window.innerHeight, width: window.innerWidth },
  bullets: [],
}

const controllers = defaultState.ships.map(ship => {
  let num = Math.random() * 100
  let cptDist = 20 + Math.random() * 100
  let cptTurn = 20 + Math.random() * 20
  const shipId = ship.id
  const getInstruction = (ship: Ship, radar: Array<RadarResult>) => {
    if (num > 0) {
      num--
      return INSTRUCTION.TURN_RIGHT
    }
    if (cptDist <= 0 && cptTurn <= 0) {
      cptDist = 20 + Math.random() * 100
      cptTurn = 20 + Math.random() * 20
    }

    if (cptDist < 0 && cptTurn > 0) {
      if (ship.position.speed) {
        return INSTRUCTION.BACK_THRUST
      }
      cptTurn--
      return INSTRUCTION.TURN_RIGHT
    }
    cptDist--
    return ship.position.speed < 11 ? INSTRUCTION.THRUST : INSTRUCTION.IDLE
  }
  return { shipId, getInstruction }
})

const App = () => {
  const [engine] = useState(new Engine(defaultState, controllers))
  return <Renderer engine={engine} />
}

export default App
