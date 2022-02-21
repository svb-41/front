import { useState } from 'react'
import { useSelector } from '@/store/hooks'
import { useNavigate } from 'react-router-dom'

import * as selectors from '@/store/selectors'
import * as HUD from '@/components/hud'
import Carousel from '@/components/carousel'
import styles from './Missions.module.css'
import Button from '@/components/button'

const Missions = () => {
  const missions = useSelector(selectors.missions)
  const navigate = useNavigate()
  const [selected, setSelected] = useState<number>(0)

  return (
    <>
      <HUD.HUD title="missions" back="/" />
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
            Mission number {selected + 1}
            <Button
              text="Start mission"
              onClick={() => navigate('/mission/' + selected)}
              color="darkgreen"
            />
            <div className={styles.description}>
              Cillum o e veniam nescius eu cupidatat velit qui excepteur
              voluptatibus. Aut qui magna ullamco, deserunt sed anim hic
              deserunt quis noster hic legam sed te veniam tempor sint offendit.
              Eiusmod duis offendit eiusmod, litteris amet fugiat eu irure.
              Constias sunt et mandaremus cohaerescant, ab eram
              consectetur.Ullamco quem possumus arbitror. Minim ullamco nam
              mentitum a quamquam ut quorum, eu est magna aliqua quid, fabulas
              qui incididunt ne hic noster pariatur si ut export litteris
              firmissimum ita esse cernantur ita summis dolore, id minim illum
              quorum excepteur. Si consequat sempiternum, illum probant
              arbitror. In multos senserit illustriora an hic quorum summis aut
              constias.
            </div>
          </div>
        </div>
      </HUD.Container>
    </>
  )
}

export default Missions
