import * as HUD from '@/components/hud'
import styles from './Pages.module.css'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <>
      <HUD.HUD title="SVB 41" />
      <HUD.Container>
        <div className={styles.container}>
          <div className={styles.title}>Tableau de bord</div>
          <div className={styles.col}>
            <Link to="/missions">
              <div className={styles.mainLink}>Missions</div>
            </Link>
            <Link to="/ai">
              <div className={styles.mainLink}>AI</div>
            </Link>
          </div>
          <Link to="/ships">
            <div className={styles.mainLink}>Ships</div>
          </Link>

          <div className={styles.col}>
            <Link to="/training">
              <div className={styles.secondaryLink}>Training</div>
            </Link>
            <Link to="/sandbox">
              <div className={styles.secondaryLink}>Sandbox</div>
            </Link>
          </div>
        </div>
      </HUD.Container>
    </>
  )
}

export default Home
