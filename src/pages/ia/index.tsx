import * as HUD from '@/components/hud'
import List, { Col } from '@/components/list'
import { useNavigate } from 'react-router-dom'

const Ia = () => {
  const navigate = useNavigate()
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
    rows: [
      {
        id: '1fbaa1a4-7a42-4337-98b3-0362803209ae',
        title: 'Boum boum',
        tags: ['atk', 'boum'],
        updatedAt: new Date('December 17, 2021 03:24:00'),
      },
      {
        id: 'b7b17d80-8765-47a0-9174-bb50893ea78e',
        title: 'Pif paf',
        tags: ['atk', 'pif'],
        updatedAt: new Date('August 22, 2021 13:24:00'),
      },
      {
        id: '5c0bcbc6-103d-4e14-be87-31477ba95b1f',
        title: 'Vroum vroum',
        tags: ['def', 'vroum'],
        updatedAt: new Date('May 27, 2021 15:24:00'),
      },
    ],
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
