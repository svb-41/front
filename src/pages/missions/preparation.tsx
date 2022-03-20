import { useState } from 'react'
import { Title, Caption } from '@/components/title'
import { Column, Row } from '@/components/flex'
import { Icon, Details } from '@/components/ship'
import { Mission } from '@/services/mission'
import { countShips } from '@/lib/ship'
import s from '@/strings.json'

export type EnemyShipsProps = {
  mission: Mission
  team: string
  clickable?: boolean
}
export const EnemyShips = ({ mission, team, clickable }: EnemyShipsProps) => {
  const cards = Object.entries(countShips(mission))
  const [selected, setSelected] = useState<string>()
  return (
    <Column gap="xl">
      <Column background="var(--eee)" padding="xl" gap="xl">
        <Column>
          <Title content={s.pages.missions.mission.enemyShips} />
          <Caption content={s.pages.missions.mission.whyEnemyShips} />
        </Column>
        <Row gap="m" wrap="wrap">
          {cards.map(([shipClass, count], i) => (
            <Column
              background="var(--ddd)"
              padding="m"
              gap="s"
              align="center"
              onClick={clickable ? () => setSelected(shipClass) : undefined}
            >
              <Row gap="s">
                <div style={{ color: 'var(--888)' }}>{count} x</div>
                <div>{shipClass}</div>
              </Row>
              <Icon shipClass={shipClass as any} key={i} team={team} />
            </Column>
          ))}
        </Row>
      </Column>
      {selected && clickable && (
        <Column padding="xl" gap="xl" background="var(--eee)">
          <Title content="Details" />
          <Row background="var(--ddd)">
            <Details
              ship={selected}
              locked={false}
              color={team}
              infoCard="var(--ccc)"
            />
          </Row>
        </Column>
      )}
    </Column>
  )
}
