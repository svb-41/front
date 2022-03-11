import { v4 } from 'uuid'
import * as HUD from '@/components/hud'
import Button from '@/components/button'
import { useSelector, useDispatch } from '@/store/hooks'
import List, { Col } from '@/components/list'
import { useNavigate } from 'react-router-dom'
import * as selectors from '@/store/selectors'
import styles from './ai.module.css'
import {
  createAI,
  deleteAI,
  setFavorite,
  delFavorite,
} from '@/store/actions/ai'
import { AI } from '@/store/reducers/ai'
import tsLogo from '@/components/monaco/ts.svg'
import { Star } from './star'

const emptyDescription =
  'Enter your description here. Use it to remember easily what the controller do.'
const favoriteDescription =
  'Add a file to your favorite to see it displayed here.'

type FileCardProps = {
  ai?: AI
  favorite?: boolean
  onFavorite?: () => void
  onClick?: () => void
}
const FileCard = ({ ai, favorite, onFavorite, onClick }: FileCardProps) => {
  const tags = ai?.tags ?? ['example']
  const createdAt = new Date(ai?.createdAt ?? Date.now())
  const updatedAt = new Date(ai?.updatedAt ?? Date.now())
  const description =
    ai?.description ?? (favorite && !ai)
      ? favoriteDescription
      : emptyDescription
  const opacity = { opacity: ai ? 1 : 0.3 }
  const params: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
  return (
    <div
      onClick={onClick}
      className={styles.fileCard}
      style={{ borderStyle: ai ? 'solid' : 'dashed' }}
    >
      <div className={styles.fileName} style={opacity}>
        <img src={tsLogo} className={styles.logo} />
        <div className={styles.filePath}>{ai?.file?.path ?? 'example.ts'}</div>
        <div style={{ flex: 1 }} />
        <div
          style={{ width: 20, height: 20, cursor: 'pointer' }}
          onClick={event => {
            event.stopPropagation()
            onFavorite?.()
          }}
        >
          <Star color="rgb(255, 176, 0)" filled={favorite} />
        </div>
      </div>
      <div className={styles.fileBody}>
        <div className={styles.fileDescription}>{description}</div>
        <div className={styles.tags} style={opacity}>
          {tags.map(tag => (
            <div key={tag} className={styles.tag}>
              {tag}
            </div>
          ))}
        </div>
        <div className={styles.modifs} style={opacity}>
          <div className={styles.modifsTitle}>
            Created at {createdAt.toLocaleString(undefined, params)}
          </div>
          <div className={styles.modifsTitle}>
            Updated at {updatedAt.toLocaleString(undefined, params)}
          </div>
        </div>
      </div>
    </div>
  )
}

const Add = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const newAI = () => {
    const uuid = v4()
    dispatch(createAI(uuid))
    navigate('/ai/' + uuid)
  }
  return (
    <div
      onClick={newAI}
      className={styles.fileCard}
      style={{
        borderStyle: 'dashed',
        background: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '3rem',
        color: '#ccc',
        cursor: 'pointer',
      }}
    >
      +
    </div>
  )
}

export const Ia = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { ais, favorites } = useSelector(selectors.ais)
  // const propsList: {
  //   cols: Array<Col>
  //   rows: Array<any>
  //   click?: (e: any) => void
  // } = {
  //   cols: [
  //     {
  //       key: 'file',
  //       title: 'Name',
  //       map: (file: File) => file.path,
  //       sort: (e1: string, e2: string) => e1.localeCompare(e2),
  //     },
  //     {
  //       key: 'file',
  //       title: 'Language',
  //       map: (file: File) => file.language,
  //       sort: (e1: string, e2: string) => e1.localeCompare(e2),
  //     },
  //     {
  //       key: 'tags',
  //       title: 'Tags',
  //       map: (e: Array<string>) => e.join(', '),
  //     },
  //     {
  //       key: 'updatedAt',
  //       title: 'Last modification',
  //       map: (e: Date | string) => {
  //         if (typeof e === 'string') return e
  //         return e.toISOString()
  //       },
  //     },
  //   ],
  //   rows: ais,
  //   click: ({ id }: { id: string }) => navigate('/ai/' + id),
  // }
  //

  const dele = (id: string) => () => {
    dispatch(deleteAI(id))
  }

  return (
    <>
      <HUD.HUD title="Artificial intelligence" back="/" />
      <HUD.Container>
        <div className={styles.container}>
          <div className={styles.filesCard}>
            <div className={styles.title}>Favorites</div>
            <div className={styles.filesCardGrid}>
              {favorites.map(favorite => {
                const ai = ais.find(ai => ai.id === favorite)
                if (!ai) return null
                const onFavorite = () => dispatch(delFavorite(ai.id))
                return (
                  <FileCard
                    onClick={() => navigate(`/ai/${ai.id}`)}
                    key={favorite}
                    ai={ai}
                    onFavorite={onFavorite}
                    favorite
                  />
                )
              })}
              {favorites.length === 0 && <FileCard favorite />}
            </div>
          </div>
          <div className={styles.filesCard}>
            <div className={styles.title}>Files</div>
            <div className={styles.filesCardGrid}>
              <Add />
              {ais.map(ai => {
                const favorite = favorites.includes(ai.id)
                const onFavorite = favorite
                  ? () => dispatch(delFavorite(ai.id))
                  : () => dispatch(setFavorite(ai.id))
                return (
                  <FileCard
                    onClick={() => navigate(`/ai/${ai.id}`)}
                    key={ai.id}
                    ai={ai}
                    onFavorite={onFavorite}
                    favorite={favorite}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </HUD.Container>
    </>
  )
}
