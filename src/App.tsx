import { useState, useEffect } from 'react'
import './App.css'
import { step, typeState, INSTRUCTION } from './engine'
import { BASIC_SHIP } from './engine/config'

const App = () => {
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

  let instructions = [
    ...new Array(12000)
      .fill(1)
      .map(_ => ({ id: BASIC_SHIP.id, instruction: INSTRUCTION.IDLE })),
    { id: BASIC_SHIP.id, instruction: INSTRUCTION.FIRE },
    ...new Array(10)
      .fill(1)
      .map(_ => ({ id: BASIC_SHIP.id, instruction: INSTRUCTION.IDLE })),
  ]
  let instructionsFire = [
    ...new Array(12000)
      .fill(1)
      .map(_ => ({ id: 'fire', instruction: INSTRUCTION.IDLE })),
    { id: 'fire', instruction: INSTRUCTION.FIRE },
    ...new Array(10)
      .fill(1)
      .map(_ => ({ id: 'fire', instruction: INSTRUCTION.TURN_LEFT })),
  ]

  const refresh = () =>
    setTimeout(() => {
      setState(state =>
        step(state, [instructions.pop()!!, instructionsFire.pop()!!])
      )
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
