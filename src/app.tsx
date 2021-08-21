import { useState } from 'react'
import './app.css'
import { Renderer } from '@/renderer'
import defaultEngine from '@/gameSetups/default'

const App = () => {
  const [engine] = useState(defaultEngine)
  return <Renderer engine={engine} />
}

export default App
