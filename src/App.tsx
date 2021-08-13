import { useState, useEffect } from 'react'
import './App.css'
import { step, typeState, INSTRUCTION, getInstructions } from './engine'
import { BASIC_SHIP } from './engine/config'
import { controller } from './engine/control'
import { ship, radarResult } from './engine/ship'

let instructions = [
  INSTRUCTION.FIRE,
  ...new Array(10).fill(1).map(_ => INSTRUCTION.IDLE),
]
let instructionsFire = [
  INSTRUCTION.FIRE,
  ...new Array(10).fill(1).map(_ => INSTRUCTION.TURN_LEFT),
]

const App = () => {
  const shipControllers: Array<controller> = [
    {
      shipId: BASIC_SHIP.id,
      getInstruction: (ship: ship, radar: Array<radarResult>) =>
        instructions.pop() || INSTRUCTION.IDLE,
    },
    {
      shipId: 'fire',
      getInstruction: (ship: ship, radar: Array<radarResult>) =>
        instructionsFire.pop() || INSTRUCTION.IDLE,
    },
  ]
  const defaultState: typeState = {
    ships: [
      BASIC_SHIP,
      {
        ...BASIC_SHIP,
        id: 'fire',
        position: { ...BASIC_SHIP.position, pos: { x: 1000, y: 0 } },
      },
    ],
    size: { height: 2000, width: 2000 },
    bullets: [],
  }
  const [state, setState] = useState(defaultState)

  const refresh = () =>
    setTimeout(() => {
      setState(state => step(state, getInstructions(state, shipControllers)))
      refresh()
    }, 1000)

  useEffect(() => {
    refresh()
  }, [])
  return (
    <div>
      <div>X: {state.ships[0].position.pos.x}</div>
      <div>Y: {state.ships[0].position.pos.y}</div>
      <div>D: {state.ships[0].position.direction}</div>
      <div>S: {state.ships[0].position.speed}</div>
    </div>
  )
}

export default App
