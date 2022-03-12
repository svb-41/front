import { Fragment } from 'react'
import * as router from 'react-router-dom'
import styles from './hud.module.css'

type LinkProps = { title: string; to: string }
const Link = ({ title, to }: LinkProps) => (
  <li className={styles.link}>
    <router.NavLink className={styles.navLink} to={to}>
      {title}
    </router.NavLink>
  </li>
)

export type Props = { children?: JSX.Element | JSX.Element[] }
export const HUD = ({ children }: Props) => (
  <Fragment>
    <nav className={styles.nav}>
      <router.Link className={styles.navTitle} to="/">
        <div className={styles.title}>SVB-41</div>
      </router.Link>
      <ul className={styles.links}>
        <Link title="Missions" to="/missions" />
        <Link title="AI" to="/ai" />
        <Link title="Ships" to="/ships" />
        <div style={{ flexGrow: 1 }} />
        <Link title="Training" to="/training" />
        <Link title="Sandbox" to="/sandbox" />
      </ul>
    </nav>
    <main className={styles.main}>{children}</main>
  </Fragment>
)
