import { useSelector } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import * as HUD from '@/components/hud'
import Carousel from '@/components/carousel'

const Missions = () => {
  const missions = useSelector(selectors.missions)

  return (
    <>
      <HUD.HUD title="missions" back="/" />
      <HUD.Container>
        <Carousel
          element={missions.map((i, index) => ({
            link: 'mission/' + i,
            img: 'https://picsum.photos/300/300/?blur=' + ((index % 10) + 1),
            value: i.toString(),
          }))}
        />
      </HUD.Container>
    </>
  )
}

export default Missions
