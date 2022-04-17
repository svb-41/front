import { Title, Caption } from '@/components/title'
import { Row, Column } from '@/components/flex'
import s from '@/strings.json'

export const Leaderboard = () => {
  return (
    <Column background="var(--eee)" padding="l" gap="l">
      <Column>
        <Title content={s.components.leaderboard.title} />
        <Caption content={s.components.leaderboard.caption} />
      </Column>
      <div style={{ whiteSpace: 'pre' }}>{s.components.leaderboard.soon}</div>
    </Column>
  )
}
