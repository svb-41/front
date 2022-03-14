import { v4 } from 'uuid'
import { HUD } from '@/components/hud'
import { useSelector, useDispatch } from '@/store/hooks'
import { useNavigate } from 'react-router-dom'
import * as selectors from '@/store/selectors'
import styles from './ai.module.css'
import * as actions from '@/store/actions/ai'
import { AI } from '@/lib/ai'
import tsLogo from '@/components/monaco/ts.svg'
import { toLocale } from '@/helpers/dates'
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
            Created at {toLocale(createdAt)}
          </div>
          <div className={styles.modifsTitle}>
            Updated at {toLocale(updatedAt)}
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
    const action = actions.createAI(uuid)
    dispatch(action)
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

type AICardsProps = {
  title: string
  ais: AI[]
  favorites: string[]
  before?: false | JSX.Element
  after?: false | JSX.Element
}
const AICards = ({ title, ais, favorites, before, after }: AICardsProps) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  return (
    <div className={styles.filesCard}>
      <div className={styles.title}>{title}</div>
      <div className={styles.filesCardGrid}>
        {before ?? null}
        {ais.map(ai => {
          const favorite = favorites.includes(ai.id)
          const onFavorite = favorite
            ? () => dispatch(actions.delFavorite(ai.id))
            : () => dispatch(actions.setFavorite(ai.id))
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
        {after ?? null}
      </div>
    </div>
  )
}

export const Ia = () => {
  const { ais, favorites } = useSelector(selectors.ais)
  const onlyFavs = ais.filter(ai => favorites.includes(ai.id))
  return (
    <HUD>
      <div className={styles.container}>
        <AICards
          title="Favorites"
          ais={onlyFavs}
          favorites={favorites}
          after={favorites.length === 0 && <FileCard favorite />}
        />
        <AICards
          title="Controllers"
          ais={ais}
          favorites={favorites}
          before={<Add />}
        />
      </div>
    </HUD>
  )
}
