import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 } from 'uuid'
import { Title } from '@/components/title'
import { Row, Column } from '@/components/flex'
import { Main } from '@/components/main'
import * as actions from '@/store/actions/ai'
import { useSelector, useDispatch } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import { AI } from '@/lib/ai'
import { toLocale } from '@/helpers/dates'
import { Star } from './star'
import tsLogo from '@/components/monaco/ts.svg'
import styles from './ai.module.css'
import s from '@/strings.json'

const { emptyDescription, favoriteDescription } = s.pages.ais

const InputDescription = (props: any) => {
  const inputRef = useRef<any>()
  const [value, setValue] = useState(props.value)
  useEffect(() => {
    if (props.value) {
      setValue(props.value)
    }
  }, [props.value])
  const onFocus = (event: any) => event.stopPropagation()
  const onChange = (event: any) => setValue(event.target.value)
  const onSubmit = (event: any) => {
    event.preventDefault()
    inputRef.current && inputRef.current.blur()
  }
  return (
    <form className={styles.inputName} onSubmit={onSubmit}>
      <textarea
        ref={inputRef}
        rows={8}
        className={styles.input}
        value={value}
        onKeyDown={event => {
          const isCmd = event.ctrlKey || event.metaKey || event.altKey
          if (isCmd && event.key === 'Enter') onSubmit(event)
        }}
        onFocus={onFocus}
        onClick={onFocus}
        onChange={onChange}
        onBlur={() => props.onSubmit(value)}
        style={{ resize: 'none', fontSize: '1rem', width: '100%' }}
      />
    </form>
  )
}

type FileCardProps = {
  ai?: AI
  favorite?: boolean
  onFavorite?: () => void
  onClick?: () => void
}
const FileCard = ({ ai, favorite, onFavorite, onClick }: FileCardProps) => {
  const dispatch = useDispatch()
  const tags = ai?.tags ?? ['example']
  const createdAt = new Date(ai?.createdAt ?? Date.now())
  const updatedAt = new Date(ai?.updatedAt ?? Date.now())
  const description =
    ai?.description ??
    (favorite && !ai ? favoriteDescription : emptyDescription)
  const opacity = { opacity: ai ? 1 : 0.3 }
  return (
    <div
      onClick={onClick}
      className={styles.fileCard}
      style={{ borderStyle: ai ? 'solid' : 'dashed' }}
    >
      <Row
        align="center"
        padding="m"
        gap="s"
        background="var(-ddd)"
        className={styles.fileName}
        style={opacity}
      >
        <img src={tsLogo} className={styles.logo} />
        <div>{ai?.file?.path ?? 'example.ts'}</div>
        <div style={{ flex: 1 }} />
        <div
          style={{ width: 20, height: 20, cursor: 'pointer' }}
          onClick={event => {
            event.stopPropagation()
            onFavorite?.()
          }}
        >
          <Star color="var(--space-yellow)" filled={favorite} />
        </div>
      </Row>
      <Column flex={1} background="var(--fff)" padding="m" gap="m">
        <InputDescription
          value={description}
          onSubmit={(description: string) =>
            ai && dispatch(actions.updateAI({ ...ai, description }))
          }
        />
        <div className={styles.tags} style={opacity}>
          {tags.map(tag => (
            <div key={tag} className={styles.tag}>
              {tag}
            </div>
          ))}
        </div>
        <Column align="flex-end" style={opacity}>
          <div className={styles.modifsTitle}>
            {s.pages.ais.createdAt} {toLocale(createdAt)}
          </div>
          <div className={styles.modifsTitle}>
            {s.pages.ais.updatedAt} {toLocale(updatedAt)}
          </div>
        </Column>
      </Column>
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
    <Column
      align="center"
      justify="center"
      onClick={newAI}
      className={styles.addCard}
    >
      +
    </Column>
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
      <Title content={title} />
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
    <Main>
      <Column padding="xl" gap="xl" align="center">
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
      </Column>
    </Main>
  )
}
