import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import './app.css'
import { State } from './engine'
import { BASIC_SHIP } from './engine/config'
import { Renderer } from '@/renderer'

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
  step: function () {
    return this
  },
}

const App = () => {
  const [state] = useState(defaultState)
  return <Renderer state={state} />
}

export default App
