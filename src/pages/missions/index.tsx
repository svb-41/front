import { useState, useEffect } from 'react'
import { useSelector } from '@/store/hooks'
import { useNavigate, useLocation } from 'react-router-dom'
import * as presentation from './presentation'
import * as preparation from './preparation'
import * as summary from './summary'
import * as selectors from '@/store/selectors'
import { Main } from '@/components/main'
import { Title, Caption } from '@/components/title'
import { FleetManager } from '@/components/fleet-manager'
import { Button } from '@/components/button'
import { Row, Column } from '@/components/flex'
import { Details } from '@/components/ship'
import { Movable } from '@/components/movable'
import { Renderer } from '@/renderer'
import * as color from '@/lib/color'
import { useEngine, State } from '@/lib/engine'
import * as services from '@/services/mission'
import styles from './Missions.module.css'
import s from '@/strings.json'
import * as helpers from '@/helpers/dates'
import tsLogo from '@/components/monaco/ts.svg'
import { AI } from '@/lib/ai'

const useMission = () => {
  const missions = useSelector(selectors.missions)
  const location = useLocation()
  const matched = location.pathname.match(/mission\/([0-9]+)/) ?? []
  const matchedID = matched[1]
  const id_ = matchedID ? parseInt(matchedID) : null
  const id = id_ && isNaN(id_) ? null : id_
  const lastMissionIndex = Math.max(0, missions.length - 1)
  const [selected, setSelected] = useState(id ?? lastMissionIndex ?? 0)
  useEffect(() => {
    setSelected(id ?? lastMissionIndex ?? 0)
  }, [missions, id, lastMissionIndex])
  useEffect(() => {
    if (id && !isNaN(id)) setSelected(id)
  }, [id])
  const mission = services.getMission(selected.toString())!
  return {
    selected,
    missions,
    mission,
    setSelected,
    opened: typeof id !== 'number',
  }
}

const usePreferences = () => {
  const player = useSelector(selectors.userData)
  const { ais } = useSelector(selectors.ais)
  const enemy = color.random.find(color => color !== player.color)!
  return { player, enemy, ais }
}

const useSetupEngine = () => {
  const preferences = usePreferences()
  const details = useMission()
  const team = preferences.player.color
  const enemy = preferences.enemy
  const ais = preferences.ais
  const mission = details.mission
  const engine = useEngine({ team, enemy, ais, mission })
  return { preferences, details, engine }
}

const AIDetails = ({
  selected,
  ais,
  team,
}: {
  ais: AI[]
  selected: string
  team: string
}) => {
  const ai = ais.find(ai => ai.id === selected)
  if (ai)
    return (
      <Column background="var(--ddd)" padding="m" gap="m">
        <Row align="center" gap="s">
          <img src={tsLogo} className={styles.logo} alt="TypeScript Logo" />
          <div className={styles.pathName}>{ai.file.path}</div>
        </Row>
        {ai.tags.length >= 0 && (
          <Row gap="s">
            {ai.tags.map(tag => (
              <Row padding="s" background={`var(--team-${team})`}>
                {tag}
              </Row>
            ))}
          </Row>
        )}
        {ai.description && (
          <div style={{ maxWidth: 200, overflow: 'hidden' }}>
            {ai.description}
          </div>
        )}
        <Column align="flex-end">
          <div className={styles.dates}>
            Created at {helpers.toLocale(new Date(ai.createdAt))}
          </div>
          <div className={styles.dates}>
            Updated at {helpers.toLocale(new Date(ai.updatedAt))}
          </div>
        </Column>
      </Column>
    )
  return (
    <Column
      background="var(--ddd)"
      align="center"
      justify="center"
      padding="xl"
    >
      <div>Click on an AI</div>
      <div>to see its details</div>
    </Column>
  )
}

export const Missions = () => {
  const { details, engine, preferences } = useSetupEngine()
  const [state, setState] = useState<State>('preparation')
  const navigate = useNavigate()
  const reset = () => navigate('/missions')
  const [selected, setSelected] = useState<string>()
  const [selectedTeam, setSelectedTeam] = useState<string>()
  return (
    <>
      <Main links={state === 'preparation'}>
        {state === 'end' && (
          <summary.Summary
            engine={engine.engine!}
            restart={() => {
              engine.reset()
              setState('preparation')
            }}
            replay={() => engine.start(setState)}
            mission={details.mission}
            back={() => {
              navigate('/missions')
              setState('preparation')
              engine.reset()
            }}
          />
        )}
        {state === 'engine' && <Renderer engine={engine.engine!} />}
        {state === 'preparation' && (
          <div className={styles.missions}>
            <presentation.MissionSelector reset={reset} {...details} />
            <presentation.MissionInformations {...details} />
            {details.opened && (
              <Column gap="xl">
                <presentation.Ships {...details} team={preferences.enemy} />
                <presentation.Submit {...details} />
              </Column>
            )}
            {!details.opened && (
              <Row className={styles.prepareMission} gap="xl">
                <FleetManager
                  team={preferences.player.color}
                  ships={preferences.player.unlockedShips}
                  ais={preferences.ais}
                  onValidConfiguration={c => c && engine.setFleet(c)}
                  width={2}
                  height={5}
                  onAIClick={id => {
                    setSelected(id)
                    setSelectedTeam(undefined)
                  }}
                  onShipClick={id => {
                    setSelected(id)
                    setSelectedTeam(preferences.player.color)
                  }}
                >
                  <Column flex={1} gap="xl">
                    <preparation.EnemyShips
                      mission={details.mission}
                      team={preferences.enemy}
                      onClick={id => {
                        setSelected(id)
                        setSelectedTeam(preferences.enemy)
                      }}
                    />
                    <Button
                      primary
                      disabled={!engine.fleet}
                      onClick={() => engine.start(setState)}
                      text={s.pages.missions.launch}
                    />
                  </Column>
                </FleetManager>
              </Row>
            )}
          </div>
        )}
      </Main>
      {selected && (
        <Movable
          onClose={() => {
            setSelected(undefined)
            setSelectedTeam(undefined)
          }}
        >
          <Column padding="l" gap="m" background="var(--eee)">
            <Title content="Details" />
            <Row background="var(--ddd)">
              {selectedTeam && (
                <Details
                  ship={selected}
                  locked={false}
                  color={selectedTeam}
                  infoCard="var(--ccc)"
                />
              )}
              {!selectedTeam && (
                <AIDetails
                  ais={preferences.ais}
                  selected={selected}
                  team={preferences.player.color}
                />
              )}
            </Row>
          </Column>
        </Movable>
      )}
    </>
  )
}
