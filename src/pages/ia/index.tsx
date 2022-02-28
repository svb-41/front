import { v4 } from 'uuid'
import * as HUD from '@/components/hud'
import Button from '@/components/button'
import { useSelector, useDispatch } from '@/store/hooks'
import List, { Col } from '@/components/list'
import { useNavigate } from 'react-router-dom'
import * as selectors from '@/store/selectors'
import styles from './ai.module.css'
import { createAI, deleteAI } from '@/store/actions/ai'
import { File } from '@/components/monaco'

const Ia = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const ais = useSelector(selectors.ais)
  const propsList: {
    cols: Array<Col>
    rows: Array<any>
    click?: (e: any) => void
  } = {
    cols: [
      {
        key: 'file',
        title: 'Name',
        map: (file: File) => file.path,
        sort: (e1: string, e2: string) => e1.localeCompare(e2),
      },
      {
        key: 'file',
        title: 'Language',
        map: (file: File) => file.language,
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
        map: (e: Date | string) => {
          if (typeof e === 'string') return e
          return e.toISOString()
        },
      },
    ],
    rows: ais,
    click: ({ id }: { id: string }) => navigate('/ai/' + id),
  }

  const newAI = () => {
    const uuid = v4()
    dispatch(createAI(uuid))
    navigate('/ai/' + uuid)
  }

  const dele = (id: string) => () => {
    dispatch(deleteAI(id))
  }

  return (
    <>
      <HUD.HUD title="Artificial intelligence" back="/" />
      <HUD.Container>
        <div className={styles.container}>
          <div className={styles.actions}>
            <Button text="new" onClick={newAI} color="green" />
            {ais.map(ai => (
              <Button
                text="delete"
                onClick={dele(ai.id)}
                color="#ee2222"
                key={ai.id}
              />
            ))}
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
