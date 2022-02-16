import * as HUD from '@/components/hud'
import { useLocation } from 'react-router-dom'

const Mission = () => {
  const location = useLocation()
  const search = location.pathname.split('/')
  const id = search[search.length - 1]
  return (
    <>
      <HUD.HUD title="missions" back="/missions" />
      <HUD.Container>
        <>mission {id}</>
      </HUD.Container>
    </>
  )
}

export default Mission
