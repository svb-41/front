import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 } from 'uuid'
import { Title } from '@/components/title'
import { Row, Column } from '@/components/flex'
import { Main } from '@/components/main'
import { Checkbox } from '@/components/checkbox'
import { Button } from '@/components/button'
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
    <Row
      tag="form"
      align="center"
      onSubmit={onSubmit}
      className={styles.inputName}
    >
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
    </Row>
  )
}

type FileCardProps = {
  textColors?: { [key: string]: string }
  tags?: { [key: string]: string }
  ai?: AI
  favorite?: boolean
  onFavorite?: () => void
  onClick?: () => void
}
const FileCard = (props: FileCardProps) => {
  const { ai, favorite, onFavorite, onClick, tags, textColors } = props
  const [tagsValue, setTagsValue] = useState('')
  const dispatch = useDispatch()
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
        <img src={tsLogo} className={styles.logo} alt="TypeScript Logo" />
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
        <form
          className={styles.inputTagsName}
          style={{ gap: (ai?.tags ?? []).length > 0 ? 's' : undefined }}
          onClick={event => event.stopPropagation()}
          onSubmit={async event => {
            event.preventDefault()
            if (ai && tagsValue.length > 0) {
              setTagsValue('')
              if (!ai.tags.includes(tagsValue)) {
                await dispatch(actions.addTag(tagsValue))
                const tags = [...ai.tags, tagsValue]
                const action = actions.updateAI({ ...ai, tags })
                dispatch(action)
              }
            }
          }}
        >
          <Row gap="s" style={opacity} wrap="wrap">
            {(ai?.tags ?? []).map(tag => (
              <Row
                color={textColors ? textColors[tag] : undefined}
                key={tag}
                className={styles.tag}
                background={tags ? tags[tag] : undefined}
              >
                <div>{tag}</div>
                <div
                  className={styles.cross}
                  onClick={() => {
                    if (ai && ai.tags.includes(tag)) {
                      const tags = ai.tags.filter(t => t !== tag)
                      const action = actions.updateAI({ ...ai, tags })
                      dispatch(action)
                    }
                  }}
                >
                  x
                </div>
              </Row>
            ))}
          </Row>
          <input
            value={tagsValue}
            onChange={event =>
              setTagsValue(event.target.value.replace(/ /g, ''))
            }
            className={styles.inputTags}
          />
        </form>
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
  textColors: { [key: string]: string }
  tags: { [key: string]: string }
  title: string
  ais: AI[]
  favorites: string[]
  before?: false | JSX.Element
  after?: false | JSX.Element
}
const AICards = (props: AICardsProps) => {
  const { tags, title, ais, favorites, before, after, textColors } = props
  const navigate = useNavigate()
  const dispatch = useDispatch()
  return (
    <Column padding="m" gap="m" width="100%" background="var(--eee)">
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
              textColors={textColors}
              tags={tags}
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
    </Column>
  )
}

const isOneTagMatched = (ai: AI, filters: string[]) => {
  for (const tag of ai.tags) if (filters.includes(tag)) return true
  return false
}

export const Ia = () => {
  const dispatch = useDispatch()
  const [filters, setFilters] = useState<string[]>([])
  const { ais, favorites } = useSelector(selectors.ais)
  const { tags, textColors } = useSelector(selectors.tags)
  const onlyFavs = ais.filter(ai => {
    const isFav = favorites.includes(ai.id)
    if (filters.length === 0) return isFav
    return isFav && isOneTagMatched(ai, filters)
  })
  const filteredAI = ais.filter(ai => {
    if (filters.length === 0) return true
    return isOneTagMatched(ai, filters)
  })
  const allTags = Object.keys(tags)
  return (
    <Main>
      <Row gap="xl" padding="xl" justify="center">
        <Column background="var(--eee)" padding="m" width={250} gap="s">
          <Title content="Filters" />
          {allTags.length === 0 && (
            <Column style={{ fontSize: '1.3rem' }} color="var(--444)">
              No tags for now. Add one and it will appear here.
            </Column>
          )}
          {allTags.length > 0 && (
            <Column gap="m">
              <div>
                Check the tags you want to see. Leaving all of them unchecked
                will disable filters.
              </div>
              <Row gap="s" justify="space-between">
                <Button
                  primary
                  disabled={filters.length === 0}
                  small
                  text="Unselect all"
                  onClick={() => setFilters([])}
                />
                <Button
                  warning
                  disabled={filters.length === 0}
                  small
                  text="Delete"
                  onClick={() => {
                    dispatch(actions.deleteTags(filters))
                    setFilters([])
                  }}
                />
              </Row>
              <Column style={{ fontSize: '1.3rem' }} gap="xs">
                {allTags.map(tag => {
                  return (
                    <Row
                      align="center"
                      gap="m"
                      tag="label"
                      style={{ cursor: 'pointer' }}
                    >
                      <Checkbox
                        checked={filters.includes(tag)}
                        onChange={value => {
                          setFilters(f =>
                            value ? [...f, tag] : f.filter(fi => fi !== tag)
                          )
                        }}
                      />
                      <Row
                        background={tags[tag]}
                        style={{ fontSize: '.9rem' }}
                        padding="xs"
                        color={textColors[tag]}
                      >
                        {tag}
                      </Row>
                    </Row>
                  )
                })}
              </Column>
            </Column>
          )}
        </Column>
        <Column gap="xl" align="center" flex={1} maxWidth={1500}>
          <AICards
            textColors={textColors}
            tags={tags}
            title="Favorites"
            ais={onlyFavs}
            favorites={favorites}
            after={onlyFavs.length === 0 && <FileCard favorite />}
          />
          <AICards
            textColors={textColors}
            tags={tags}
            title="Controllers"
            ais={filteredAI}
            favorites={favorites}
            before={<Add />}
          />
        </Column>
      </Row>
    </Main>
  )
}
