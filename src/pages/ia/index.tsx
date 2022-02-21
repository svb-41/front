import * as HUD from '@/components/hud'
import { useSelector } from '@/store/hooks'
import List, { Col } from '@/components/list'
import { useNavigate } from 'react-router-dom'
import * as selectors from '@/store/selectors'

const Ia = () => {
  const navigate = useNavigate()
  const ais = useSelector(selectors.ais)
  const propsList: {
    cols: Array<Col>
    rows: Array<any>
    click?: (e: any) => void
  } = {
    cols: [
      {
        key: 'title',
        title: 'Name',
        sort: (e1: string, e2: string) => e1.localeCompare(e2),
      },
      {
        key: 'tags',
        title: 'Tags',
        map: (e: Array<string>) => e.join(', '),
      },
      {
        key: 'updatedAt',
        title: 'Last modification',
        map: (e: Date) => e.toISOString(),
      },
    ],
    rows: ais,
    click: ({ id }: { id: string }) => navigate('/ai/' + id),
  }
  return (
    <>
      <HUD.HUD title="Artificial intelligence" back="/" />
      <HUD.Container>
        <div>
          <List {...propsList} />
        </div>
      </HUD.Container>
    </>
  )
}

export default Ia
