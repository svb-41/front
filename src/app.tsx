import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import './app.css'
import { State } from './engine'
import danceController from './controllers/dance'
import holdTheLineController from './controllers/dance'
import { buildBasicShip } from './engine/config'
import { Renderer } from '@/renderer'
import { Engine } from '@/engine'

const teams = ['red', 'blue']
const nb = 100

const defaultState: State = {
  ships: new Array(nb).fill(0).map((_, index: number) => {
    const side = index > nb / 2
    const team = teams[side ? 0 : 1]
    const id = uuid()
    const x = Math.round(
      side ? window.innerWidth * 0.2 : window.innerWidth * 0.8
    )
    const y = Math.round(
      Math.random() * window.innerHeight * 0.8 + window.innerHeight * 0.1
    )
    const pos = { x, y }
    const position = {
      pos,
      direction: side ? 0 : Math.PI,
    }
    return buildBasicShip({ id, position, team })
  }),
  size: { height: window.innerHeight, width: window.innerWidth },
  teams,
  bullets: [],
  maxSpeed: 100,
}

const controllers = defaultState.ships.map(ship =>
  Math.random() > 0.5 ? danceController(ship) : holdTheLineController(ship)
)

const App = () => {
  const [engine] = useState(new Engine(defaultState, controllers))
  return <Renderer engine={engine} />
}

export default App
