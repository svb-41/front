import { AI } from '@/lib/ai'
import { useSelector } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import { getImage } from '@/helpers/ships'
import { Title, SubTitle } from '@/components/title'
import { Row, Column } from '@/components/flex'
import tsLogo from '@/components/monaco/ts.svg'
import * as helpers from '@/helpers'
import styles from './fleet-manager.module.css'

const Tab = ({ onClick, text, className }: any) => (
  <button onClick={onClick} className={className}>
    {text}
  </button>
)

const ShipSelectorTabs = ({ state, setState }: any) => {
  const cl = (v: string) => (state === v ? styles.tab : styles.inactiveTab)
  const s = 'ships'
  return (
    <Row>
      <Tab onClick={() => setState(s)} className={cl(s)} text="Ships" />
      <Tab onClick={() => setState('ai')} className={cl('ai')} text="AI" />
    </Row>
  )
}

const RenderShips = ({
  ships,
  setShipDetails,
  prices,
  onDragStart,
  team,
  onShipClick,
}: any) => (
  <div className={styles.renderShips}>
    {helpers.ships.ships.map((ship, index) => {
      const unlocked = ships.includes(ship)
      return (
        <div
          key={index}
          className={styles.availableShip}
          onClick={unlocked ? () => onShipClick?.(ship) : undefined}
          onDoubleClick={unlocked ? () => setShipDetails?.(ship) : undefined}
          style={unlocked ? undefined : { filter: 'brightness(0.2)' }}
        >
          <div>{unlocked ? ship : '???'}</div>
          <img
            onDragStart={unlocked ? () => onDragStart(ship) : undefined}
            src={getImage(ship, team)}
            className={styles.img}
            alt={ship}
          />
          {prices[ship] ? prices[ship] : ''}
        </div>
      )
    })}
  </div>
)

const filterAsCols = (ais: AI[]) => {
  const [cols, remaining] = ais.reduce(
    (acc, val, index) => {
      const [prev, act] = acc
      if (index === 0) return [prev, [...act, val]]
      if (index % 2 === 0) return [[...prev, act], [val]]
      return [prev, [...act, val]]
    },
    [[], []] as [AI[][], AI[]]
  )
  return [...cols, remaining]
}

const RenderColumnAI = ({
  columns,
  setAIDetails,
  onAIClick,
  textColors,
  tags,
  title,
}: {
  columns: AI[][]
  setAIDetails: any
  onAIClick: any
  textColors: any
  tags: any
  title: string
}) => {
  return (
    <Column gap="s">
      <SubTitle color="var(--333)" content={title} />
      {columns.map((ais, i) => (
        <Row gap="s" key={i}>
          {ais.map(ai => (
            <div
              className={styles.cursor}
              key={ai.id}
              onDoubleClick={() => setAIDetails?.(ai.id)}
              onClick={() => onAIClick?.(ai.id)}
            >
              <Column background="var(--ddd)" padding="s" gap="s" height="100%">
                <Row align="center" gap="s">
                  <img
                    src={tsLogo}
                    className={styles.logo}
                    alt="TypeScript Logo"
                  />
                  <div className={styles.pathName}>{ai.file.path}</div>
                </Row>
                <Row wrap="wrap" gap="s" flex={1}>
                  {ai.tags.map(tag => {
                    return (
                      <Row
                        background={tags[tag]}
                        color={textColors[tag]}
                        padding="xs"
                      >
                        {tag}
                      </Row>
                    )
                  })}
                </Row>
                <Column align="flex-end">
                  <div className={styles.dates}>
                    Created at {helpers.dates.toLocale(new Date(ai.createdAt))}
                  </div>
                  <div className={styles.dates}>
                    Updated at {helpers.dates.toLocale(new Date(ai.updatedAt))}
                  </div>
                </Column>
              </Column>
            </div>
          ))}
          {ais.length < 2 && <div className={styles.cursor} />}
        </Row>
      ))}
    </Column>
  )
}

const RenderAIs = ({
  ais,
  favoritesAI,
  setAIDetails,
  onAIClick,
}: {
  ais: AI[]
  favoritesAI: string[]
  setAIDetails?: (value: string) => void
  onAIClick?: (value: string) => void
}) => {
  const { tags, textColors } = useSelector(selectors.tags)
  const favs = ais.filter(ai => favoritesAI.includes(ai.id))
  const notFavs = ais.filter(ai => !favoritesAI.includes(ai.id))
  const favorites = filterAsCols(favs)
  const unfavorites = filterAsCols(notFavs)
  return (
    <Column gap="l">
      {favs.length > 0 && (
        <RenderColumnAI
          title="Favorites"
          columns={favorites}
          setAIDetails={setAIDetails}
          onAIClick={onAIClick}
          textColors={textColors}
          tags={tags}
        />
      )}
      {notFavs.length > 0 && (
        <RenderColumnAI
          title="Unfavorites"
          columns={unfavorites}
          setAIDetails={setAIDetails}
          onAIClick={onAIClick}
          textColors={textColors}
          tags={tags}
        />
      )}
    </Column>
  )
}

export const ShipSelector = (props: any) => {
  const subtitle = props.state === 'ai' ? 'Available AI' : 'Available ships'
  return (
    <Column className={styles.tabber}>
      <ShipSelectorTabs {...props} />
      <Column background="var(--eee)" padding="xl" gap="m" flex={1}>
        <Title content={subtitle} />
        {props.state === 'ships' && <RenderShips {...props} />}
        {props.state === 'ai' && <RenderAIs {...props} />}
      </Column>
    </Column>
  )
}
