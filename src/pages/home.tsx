import { useState } from 'react'
import { HUD } from '@/components/hud'
import { Row, Column } from '@/components/flex'
import { Title, SubTitle, Jumbotron } from '@/components/title'
import * as button from '@/components/button'
import styles from './pages.module.css'
import { Link } from 'react-router-dom'

const InfoTabs = () => {
  const [active, setActive] = useState<'news' | 'credits'>('news')
  return (
    <Column maxWidth={400} width="100%">
      <Row>
        <button
          className={active === 'news' ? styles.activeTab : styles.tab}
          onClick={() => setActive('news')}
        >
          News
        </button>
        <button
          className={active === 'credits' ? styles.activeTab : styles.tab}
          onClick={() => setActive('credits')}
        >
          Credits
        </button>
      </Row>
      {active === 'news' && (
        <Column background="#eee" padding="l" flex={1} gap="s">
          <div>Nothing here… yet!</div>
          <div>More information soon…</div>
        </Column>
      )}
      {active === 'credits' && (
        <Column background="#eee" padding="l" flex={1} gap="l">
          <Column background="#ddd" padding="m" gap="xs">
            <SubTitle color="#666" content="Arthur Escriou" />
            <p className={styles.p}>
              {`The author, creator and ideator. He thought & built SVB-41. He’s the master of physics, and a crazy tinkerer. He does some magic stuff with code, and handles servers like one.
              He’s actually occupied to fix the galaxy-wide messaging system.`}
            </p>
            <div />
            <div />
            <div />
            <div>
              Find him on GitHub{' '}
              <a
                className={styles.link}
                href="https://github.com/arthurescriou"
              >
                @arthurescriou
              </a>
            </div>
          </Column>
          <Column background="#ddd" padding="m" gap="xs">
            <SubTitle color="#666" content="Guillaume Hivert" />
            <p className={styles.p}>
              {`The one behind the UX, UI and all the graphical stuff you can see. CSS wizard, he bends the rules of the web to its will. He’s always trying to improve designs and to decentralize things.
                He loves emojis and tries hard to discover hidden spots in the universe.`}
            </p>
            <div />
            <div />
            <div />
            <div>
              Find him on GitHub{' '}
              <a className={styles.link} href="https://github.com/ghivert">
                @ghivert
              </a>
            </div>
          </Column>
          <Column background="#ddd" padding="m" gap="xs">
            <SubTitle color="#666" content="Camille Laurent" />
            <p className={styles.p}>
              {`Official mascot of the SVB-41, she found the name, the visual identity and she’s the best at sending dog pictures. In front of her, even the strongest generals can’t resist.
                She’s currently checking that everyone are properly working and contiuously send them more work to do.`}
            </p>
          </Column>
        </Column>
      )}
    </Column>
  )
}

export const Home = () => (
  <HUD>
    <Row justify="center" padding="xxl" gap="xxl">
      <Column gap="xxl" maxWidth={700} flex={1}>
        <Column gap="s">
          <Title content="Welcome commander, on" />
          <Jumbotron content="SVB-41" />
        </Column>
        <Column background="#eee" padding="m" gap="s">
          <SubTitle blinking content="Incoming message from HQ" />
          <p className={styles.p}>
            {`We’re glad to see you there, commander. It’s been a while, since the last time. In case you need to refresh your mind, you can try the virtualized environments. We made a fully-working training mode, and a perfectly working sandbox. We know you’ll make good use of it.

            You should immediately try to create or use your first AI if you didn’t already. We also have some AI for you, ready to use. Remember, you won’t control your ships directly.

            Otherwise, you are awaited on the steering deck of your mothership. You missed your crew during your absence. Oh, and we’ll occasionally send you some message, directly here, in your room. Keep an eye of it. Or maybe you want to be notified directly? Well, our messaging system is broken at that time, but our engineers are working on it. We expect to put it back online in a couple of weeks at most. Covering the entire galaxy is not as easy as pie.`}
          </p>
        </Column>
        <Column gap="m">
          <Link className={button.style({ primary: true })} to="/missions">
            <div className={styles.mainLink}>Campaign</div>
          </Link>
          <Link className={button.style({ primary: true })} to="/ai">
            <div className={styles.mainLink}>AI</div>
          </Link>
          <Link className={button.style({ primary: true })} to="/ships">
            <div className={styles.mainLink}>Ships</div>
          </Link>
        </Column>
        {false && (
          <>
            <Link to="/training">
              <div className={styles.secondaryLink}>Training</div>
            </Link>
            <Link to="/sandbox">
              <div className={styles.secondaryLink}>Sandbox</div>
            </Link>
          </>
        )}
      </Column>
      <InfoTabs />
    </Row>
  </HUD>
)
