import { useState, useEffect } from 'react'
import './App.css'
import { step, typeState } from './engine'
import { BASIC_SHIP } from './engine/config'
import { position } from './engine/ship'

const App = () => {
  const defaultState: typeState = {
    ships: [BASIC_SHIP],
    size: { height: 2000, width: 2000 },
  }
  const [state, setState] = useState(defaultState)

  const refresh = (): Promise<any> =>
    new Promise((resolve, reject) =>
      setTimeout(() => {
        setState(state => step(state, []))
        resolve(null)
      }, 1000)
    ).then(refresh)

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
