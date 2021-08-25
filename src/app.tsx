import { useState, Fragment } from 'react'
import { Renderer } from '@/renderer'
import defaultEngine from '@/gameSetups/default'
import * as HUD from '@/components/hud'

const App = () => {
  return (
    <Fragment>
      <Renderer engine={engine} />
      <HUD.Render state={screen} onClick={onClick} />
    </Fragment>
  )
}

export default App
