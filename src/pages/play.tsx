import { useState, useEffect, Fragment } from 'react'
import { engine } from '@svb-41/engine'
import { Renderer } from '@/renderer'
import defaultEngine from '@/game-setups/default'
import * as HUD from '@/components/hud'

const App = () => {
  const [screen, setScreen] = useState<HUD.State>('game')
  const [engine, setEngine] = useState<engine.Engine>()

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
    </Fragment>
  )
}

export default App
