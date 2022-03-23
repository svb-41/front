import { useState } from 'react'
import { AI } from '@/lib/ai'
import { getImage } from '@/helpers/ships'
import { SubTitle } from '@/components/title'
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
          onClick={() => onShipClick(ship)}
          onDoubleClick={() => setShipDetails(ship)}
          style={unlocked ? undefined : { filter: 'brightness(0.2)' }}
        >
          <div>{unlocked ? ship : '???'}</div>
          <img
            onDragStart={() => onDragStart(ship)}
            src={getImage(ship, team)}
            className={styles.img}
            alt={ship}
          />
        </div>
      )
    })}
  </div>
)

const RenderAIs = ({
  ais,
  setAIDetails,
  onAIDragStart,
}: {
  ais: AI[]
  setAIDetails: (value: string) => void
  onAIDragStart: (value: string) => void
}) => {
  const [cols, remaining] = ais.reduce(
    (acc, val, index) => {
      const [prev, act] = acc
      if (index === 0) return [prev, [...act, val]]
      if (index % 2 === 0) return [[...prev, act], [val]]
      return [prev, [...act, val]]
    },
    [[], []] as [AI[][], AI[]]
  )
  const final = [...cols, remaining]
  return (
    <Column gap="s">
      {final.map((ais, i) => (
        <Row gap="s" key={i}>
          {ais.map(ai => (
            <div
              className={styles.cursor}
              key={ai.id}
              draggable
              onDragStart={() => onAIDragStart(ai.id)}
              onClick={() => setAIDetails(ai.id)}
            >
              <Column background="var(--ddd)" padding="s" gap="s">
                <Row align="center" gap="s">
                  <img
                    src={tsLogo}
                    className={styles.logo}
                    alt="TypeScript Logo"
                  />
                  <div className={styles.pathName}>{ai.file.path}</div>
                </Row>
                <Column>
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
        </Row>
      ))}
    </Column>
  )
}

export const ShipSelector = (props: any) => {
  const [state, setState] = useState<'ships' | 'ai'>('ships')
  const subtitle = state === 'ai' ? 'Available AI' : 'Available ships'
  return (
    <Column flex={1}>
      <ShipSelectorTabs state={state} setState={setState} />
      <Column background="var(--eee)" padding="m" gap="s" flex={1}>
        <SubTitle content={subtitle} />
        {state === 'ships' && <RenderShips {...props} />}
        {state === 'ai' && <RenderAIs {...props} />}
      </Column>
    </Column>
  )
}
