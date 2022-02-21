import * as HUD from '@/components/hud'
import { useLocation } from 'react-router-dom'
import * as Monaco from '@/components/monaco'
import styles from './ai.module.css'

const Mission = () => {
  const location = useLocation()
  const search = location.pathname.split('/')
  const id = search[search.length - 1]
  return (
    <>
      <HUD.HUD title="Artificial intelligence" back="/ai" />
      <HUD.Container>
        <></>
      </HUD.Container>
    </>
  )
}

export default Mission
