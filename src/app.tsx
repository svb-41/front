import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import './app.css'
import { State } from './engine'
import danceController from './controllers/dance'
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

const controllers = defaultState.ships.map(danceController)

const App = () => {
  const [engine] = useState(new Engine(defaultState, controllers))
  return <Renderer engine={engine} />
}

export default App
