import { Fragment } from 'react'
import * as router from 'react-router-dom'
import { Row, Column } from '@/components/flex'
import styles from './main.module.css'
import s from '@/strings.json'

type LinkProps = { title: string; to: string }
const Link = ({ title, to }: LinkProps) => (
  <li>
    <router.NavLink className={styles.navLink} to={to}>
      {title}
    </router.NavLink>
  </li>
)

export type Elem = JSX.Element | false
export type Props = { children?: Elem | Elem[]; links?: boolean }
export const Main = ({ children, links = true }: Props) => (
  <Fragment>
    <Row
      className={styles.nav}
      align="baseline"
      background="var(--eee)"
      padding="xl"
      gap="xxl"
    >
      <router.Link to="/">
        <div className={styles.logo}>{s.svb}</div>
      </router.Link>
      {links && (
        <Row tag="ul" className={styles.links} flex={1} gap="l">
          <Link title="Campaign" to="/missions" />
          <Link title="AI" to="/ai" />
          <Link title="Ships" to="/ships" />
          <Link title="Database" to="/database" />
          <div style={{ flexGrow: 1 }} />
          {false && <Link title="Training" to="/training" />}
          {false && <Link title="Sandbox" to="/sandbox" />}
        </Row>
      )}
    </Row>
    <Column tag="main" flex={1}>
      {children}
    </Column>
  </Fragment>
)
