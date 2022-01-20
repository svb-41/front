import { useState, useEffect, Fragment } from 'react'
import { Engine } from '@/engine'
import { Renderer } from '@/renderer'
import defaultEngine from '@/game-setups/default'
import * as HUD from '@/components/hud'
import * as Monaco from '@/components/monaco'

const App = () => {
  const [screen, setScreen] = useState<HUD.State>('game')
  const [engine, setEngine] = useState<Engine>()

  useEffect(() => {
    defaultEngine().then(setEngine)
  }, [])
  const onClick = () => {
    const newScreen = screen === 'game' ? 'editor' : 'game'
    setScreen(newScreen)
  }
  return (
    <Fragment>
      <HUD.HUD />
      {screen === 'game' && engine && <Renderer engine={engine} />}
      {screen === 'editor' && <Monaco.Monaco />}
    </Fragment>
  )
}

export default App
