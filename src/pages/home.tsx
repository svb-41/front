import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Main } from '@/components/main'
import { Row, Column } from '@/components/flex'
import { Title, SubTitle, Jumbotron } from '@/components/title'
import * as button from '@/components/button'
import styles from './pages.module.css'
import s from '@/strings.json'

type TabNames = 'news' | 'credits'
const Tabs = ({ active, setActive }: { active: TabNames; setActive: any }) => {
  const Tab = ({ value }: { value: TabNames }) => {
    const isActive = active === value ? styles.activeTab : styles.tab
    return (
      <button className={isActive} onClick={() => setActive(value)}>
        {s.pages.home.tabs[value]}
      </button>
    )
  }
  return (
    <Row color="var(--000)">
      <Tab value="news" />
      <Tab value="credits" />
    </Row>
  )
}

const News = () => (
  <Column background="var(--eee)" padding="l" flex={1} gap="s">
    <div>{s.pages.home.news.nothingHere}</div>
    <div>{s.pages.home.news.moreInfoSoon}</div>
  </Column>
)

type Authors = 'arthur' | 'guillaume' | 'camille'
type CreditsCardProps = { value: Authors; github?: string }
const CreditsCard = ({ value, github }: CreditsCardProps) => {
  const sub = s.pages.home.creators.titles[value]
  return (
    <Column background="var(--ddd)" padding="m" gap="xs">
      <SubTitle color="var(--666)" content={sub} />
      <p>{s.pages.home.creators[value]}</p>
      {github && (
        <div className={styles.github}>
          {s.pages.home.creators.findHim}{' '}
          <a className={styles.link} href={`https://github.com/${github}`}>
            @{github}
          </a>
        </div>
      )}
    </Column>
  )
}

const Credits = () => (
  <Column background="var(--eee)" padding="l" flex={1} gap="l">
    <CreditsCard value="arthur" github="arthurescriou" />
    <CreditsCard value="guillaume" github="ghivert" />
    <CreditsCard value="camille" />
  </Column>
)

const InfoTabs = () => {
  const [active, setActive] = useState<'news' | 'credits'>('news')
  return (
    <Column maxWidth={400} width="100%">
      <Tabs active={active} setActive={setActive} />
      {active === 'news' && <News />}
      {active === 'credits' && <Credits />}
    </Column>
  )
}

export const Home = () => (
  <Main>
    <Row justify="center" padding="xxl" gap="xxl">
      <Column gap="xxl" maxWidth={700} flex={1}>
        <Column gap="s">
          <Title content={s.pages.home.welcome} />
          <Jumbotron content={s.svb} />
        </Column>
        <Column background="var(--eee)" padding="m" gap="s">
          <SubTitle blinking content={s.incomingMessage} />
          <p>{s.pages.home.message}</p>
        </Column>
        <Column gap="xl">
          <Column gap="s">
            <SubTitle content="Play" />
            <Link className={button.style({ primary: true })} to="/missions">
              <div className={styles.mainLink}>Campaign</div>
            </Link>
            <Link className={button.style({ primary: true })} to="/ai">
              <div className={styles.mainLink}>AI</div>
            </Link>
          </Column>
          <Column gap="s">
            <SubTitle content="Learn" />
            <Link className={button.style({ primary: true })} to="/ships">
              <div className={styles.mainLink}>Ships</div>
            </Link>
            <Link className={button.style({ primary: true })} to="/database">
              <div className={styles.mainLink}>Database</div>
            </Link>
          </Column>
          <Column gap="s">
            <SubTitle content="Connect" />
            <Link className={button.style({ primary: true })} to="/account">
              <div className={styles.mainLink}>Account</div>
            </Link>
          </Column>
        </Column>
      </Column>
      <InfoTabs />
    </Row>
  </Main>
)
