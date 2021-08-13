import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import './app.css'
import { State, INSTRUCTION } from './engine'
import { BASIC_SHIP } from './engine/config'
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
  const num = Math.random()
  const inst = num < 0.5 ? INSTRUCTION.TURN_RIGHT : INSTRUCTION.TURN_LEFT
  const shipId = ship.id
  const getInstruction = () => inst
  return { shipId, getInstruction }
})

const App = () => {
  const [engine] = useState(new Engine(defaultState, controllers))
  return <Renderer engine={engine} />
}

export default App
