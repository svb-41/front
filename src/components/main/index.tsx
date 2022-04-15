import { Fragment } from 'react'
import * as router from 'react-router-dom'
import { useSelector } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import { Row, Column } from '@/components/flex'
import { URL } from '@/envs'
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

const Identicon = ({ username }: { username: string }) => {
  const navigate = router.useNavigate()
  const onClick = (event: any) => {
    event.preventDefault()
    navigate('/account')
  }
  return (
    <a onClick={onClick} href="/account" className={styles.identicon}>
      <div style={{ padding: 'var(--s) var(--m)' }}>{username}</div>
      <img
        src={`${URL}/user/${username}.svg`}
        className={styles.identiconImg}
      />
    </a>
  )
}

export type Elem = JSX.Element | false
export type Props = { children?: Elem | Elem[]; links?: boolean }
export const Main = ({ children, links = true }: Props) => {
  const username = useSelector(selectors.userData).user?.username
  return (
    <Fragment>
      <Row
        className={styles.nav}
        align="baseline"
        background="var(--eee)"
        padding="xl"
        gap="xxl"
        height={85}
      >
        <router.Link to="/">
          <div className={styles.logo}>{s.svb}</div>
        </router.Link>
        {links && (
          <Row
            tag="ul"
            align="center"
            className={styles.links}
            flex={1}
            gap="l"
          >
            <Link title="Campaign" to="/missions" />
            <Link title="AI" to="/ai" />
            <Link title="Ships" to="/ships" />
            <Link title="Database" to="/database" />
            <div style={{ flexGrow: 1 }} />
            {!username && <Link title="Account" to="/account" />}
            {false && <Link title="Training" to="/training" />}
            {false && <Link title="Sandbox" to="/sandbox" />}
          </Row>
        )}
        {!links && <div style={{ flexGrow: 1 }} />}
        {username && <Identicon username={username} />}
      </Row>
      <Column tag="main" flex={1}>
        {children}
      </Column>
    </Fragment>
  )
}
