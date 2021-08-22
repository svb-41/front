import { useState, Fragment } from 'react'
import { Renderer } from '@/renderer'
import defaultEngine from '@/gameSetups/default'
import { HUD } from '@/hud'

const App = () => {
  const [engine] = useState(defaultEngine)
  return (
    <Fragment>
      <HUD />
      <Renderer engine={engine} />
    </Fragment>
  )
}

export default App
