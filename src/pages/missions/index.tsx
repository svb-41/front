import { useState } from 'react'
import { useSelector } from '@/store/hooks'
import { useNavigate } from 'react-router-dom'

import * as selectors from '@/store/selectors'
import * as HUD from '@/components/hud'
import Carousel from '@/components/carousel'
import styles from './Missions.module.css'
import Button from '@/components/button'
import { Mission, getMission } from '@/services/mission'

const Missions = () => {
  const missions = useSelector(selectors.missions)
  const navigate = useNavigate()
  const [selected, setSelected] = useState<number>(0)
  const mission = getMission(selected.toString())
  return (
    <>
      <HUD.HUD title="Missions" back="/" />
      <HUD.Container>
        <div className={styles.missions}>
          <Carousel
            onChange={setSelected}
            element={missions.map((i, index) => ({
              link: 'mission/' + i,
              img: 'https://picsum.photos/300/300/?qsd=' + index,
              value: i.toString(),
            }))}
          />
          <div className={styles.info}>
            {`${mission.title} (#${mission.id})`}
            <Button
              text="Start mission"
              onClick={() => navigate('/mission/' + selected)}
              color="darkgreen"
            />
            <div className={styles.description}>{mission.description}</div>
          </div>
        </div>
      </HUD.Container>
    </>
  )
}

export default Missions
