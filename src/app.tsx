import { useState, Fragment } from 'react'
import { Renderer } from '@/renderer'
import defaultEngine from '@/game-setups/default'
import * as HUD from '@/components/hud'
import * as Monaco from '@/components/monaco'

const App = () => {
  const [screen, setScreen] = useState<HUD.State>('game')
  const onClick = () => {
    const newScreen = screen === 'game' ? 'editor' : 'game'
    setScreen(newScreen)
  }
  return (
    <Fragment>
      <HUD.HUD state={screen} onClick={onClick} />
      {screen === 'game' && <Renderer engine={defaultEngine()} />}
      {screen === 'editor' && <Monaco.Monaco />}
    </Fragment>
  )
}

export default App
