import { useEffect, useRef, useState } from 'react'
import { Engine } from '@/engine'
import { Renderer } from '@/renderer'
import * as HUD from '@/components/hud'
import { useLocation } from 'react-router-dom'
import defaultEngine from '@/game-setups/default'
import styles from './Missions.module.css'

const Mission = () => {
  const location = useLocation()
  const search = location.pathname.split('/')
  const [engine, setEngine] = useState<Engine>()

  const id = search[search.length - 1]

  useEffect(() => {
    defaultEngine().then(setEngine)
  }, [])

  return (
    <>
      <HUD.HUD title="Missions" back="/missions" />
      {engine ? <Renderer engine={engine} /> : <></>}
    </>
  )
}

export default Mission
