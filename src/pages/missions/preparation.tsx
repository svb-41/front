import { Title, Caption } from '@/components/title'
import { Column, Row } from '@/components/flex'
import { Icon } from '@/components/ship'
import { Mission } from '@/services/mission'
import { countShips } from '@/lib/ships'
import s from '@/strings.json'

export const renderShip = (team: string, onClick?: (id: string) => void) => {
  return ([shipClass, count]: [string, number], i: number) => {
    const c = onClick ? () => onClick(shipClass) : undefined
    return (
      <Column
        key={shipClass}
        background="var(--ddd)"
        padding="m"
        gap="s"
        align="center"
        onClick={c}
      >
        <Row gap="s">
          <div style={{ color: 'var(--888)' }}>{count} x</div>
          <div>{shipClass}</div>
        </Row>
        <Icon shipClass={shipClass as any} key={i} team={team} />
      </Column>
    )
  }
}

export type EnemyShipsProps = {
  mission: Mission
  team: string
  onClick?: (id: string) => void
}
export const EnemyShips = ({ mission, team, onClick }: EnemyShipsProps) => {
  const cards = Object.entries(countShips(mission))
  return (
    <Column gap="xl">
      <Column background="var(--eee)" padding="xl" gap="xl">
        <Column>
          <Title content={s.pages.missions.mission.enemyShips} />
          <Caption content={s.pages.missions.mission.whyEnemyShips} />
        </Column>
        <Row gap="m" wrap="wrap">
          {cards.map(renderShip(team, onClick))}
        </Row>
      </Column>
    </Column>
  )
}
