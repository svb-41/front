import { useNavigate } from 'react-router-dom'
import { HUD } from '@/components/hud'
import { Row, Column } from '@/components/flex'
import { Title, SubTitle } from '@/components/title'
import { Button } from '@/components/button'
import styles from './pages.module.css'
import s from '@/strings.json'

export const NotFound = () => {
  const navigate = useNavigate()
  return (
    <HUD>
      <Column padding="xxl" align="center">
        <Column padding="xxl" background="var(--eee)" maxWidth={1500}>
          <Column>
            <Title content={s.pages.notFound.title} />
            <SubTitle content={s.pages.notFound.subtitle} />
          </Column>
          <div className={styles.notFound}>404</div>
          <Row gap="xxl">
            <Button
              style={{ flex: 1 }}
              secondary
              text={s.pages.notFound.back}
              onClick={() => navigate(-1)}
            />
            <Button
              style={{ flex: 1 }}
              primary
              text={s.pages.notFound.backToHome}
              onClick={() => navigate('/', { replace: true })}
            />
          </Row>
        </Column>
      </Column>
    </HUD>
  )
}
