import { v4 } from 'uuid'
import * as HUD from '@/components/hud'
import Button from '@/components/button'
import { useSelector } from '@/store/hooks'
import List, { Col } from '@/components/list'
import { useNavigate } from 'react-router-dom'
import * as selectors from '@/store/selectors'
import styles from './ai.module.css'
import { createAI } from '@/store/actions/ai'

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

  const newAI = () => {
    const uuid = v4()
    createAI(uuid)
    navigate('/ai/' + uuid)
  }

  return (
    <>
      <HUD.HUD title="Artificial intelligence" back="/" />
      <HUD.Container>
        <div className={styles.container}>
          <div className={styles.actions}>
            <Button text="new" onClick={newAI} color="green" />
          </div>
          <div className={styles.list}>
            <List {...propsList} />
          </div>
        </div>
      </HUD.Container>
    </>
  )
}

export default Ia
