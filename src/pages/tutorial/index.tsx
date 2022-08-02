import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { assault } from '@/default-controllers/assets.json'
import { Column, Row } from '@/components/flex'
import * as Flex from '@/components/flex'
import * as Movable from '@/components/movable'
import { Conversation } from './conversation'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { Fight } from '@/components/fight'
import { Title, SubTitle } from '@/components/title'
import * as Monaco from '@/components/monaco'
import * as store from '@/store'
import { Dimensions, dimensions, useResize } from '@/lib/window'
import * as Desktop from '@/components/desktop'
import { useDesktop } from '@/components/desktop'
import { ActivityIndicator } from '@/components/activity-indicator'
import { AI } from '@/lib/ai'
import { getSimulation } from '@/services/mission'
import * as svb from '@svb-41/engine'
import { getMissionEnemy } from '@/lib/engine'
import * as lib from '@/lib'
import loader from '@/assets/icons/loader.gif'
import valid from '@/assets/icons/valid.svg'
import error from '@/assets/icons/error.svg'
import styles from './tutorial.module.css'
import { lessons } from './lesson'
import s from '@/strings.json'

export type Page = 'introduction' | 'start'

const onResize = (force: boolean) => {
  return (dims: Dimensions, apps: Desktop.App[]) => {
    return apps.map(app => {
      if (typeof app.fullscreen !== 'object' && !force) return app
      if (app.id === 'Tutorial') {
        const height = dims.height - Movable.TOP_SPACE - 24
        const size = { width: 400, height }
        const position = { top: 12, left: 12 }
        return { ...app, fullscreen: { size, position } }
      }
      if (app.name === 'Fight') {
        const width = dims.width - 400 - 12 - 12 - 12
        const height = dims.height - Movable.TOP_SPACE - 24
        const size = { height, width }
        const position = { top: 12, left: dims.width - width - 12 }
        return { ...app, fullscreen: { position, size } }
      }
      return app
    })
  }
}

const BrilliantVictory = ({ onClick }: { onClick: () => void }) => {
  const [cont, setContinue] = useState(false)
  const desktop = useDesktop()
  useEffect(() => {
    setTimeout(() => {
      setContinue(true)
    }, 1000)
  }, [])
  return (
    <Column flex={1} align="center" justify="center" gap="l">
      <Column gap="l">
        <Column>
          <Title content="WHAT A FUCKING BRILLIANT VICTORY" />
          <SubTitle content="Soon, you'll be able to do the same, cadet." />
        </Column>
        <Column align="flex-end">
          <Button
            text="Click to continue…"
            small
            primary
            style={{ transition: 'all .2s', opacity: cont ? 1 : 0 }}
            onClick={() => {
              desktop.apps.close('Fight')
              onClick()
            }}
          />
        </Column>
      </Column>
    </Column>
  )
}

const onStartFight = (desktop: Desktop.Handler) => {
  const ai = lib.ai.fromDefault('strong', 'fastAssault')
  const width = window.innerWidth - 400 - 12 - 12 - 12
  const height = window.innerHeight - Movable.TOP_SPACE - 24
  const left = window.innerWidth - width - 12
  const position = { top: 12, left }
  const size = { height, width }
  const mission = getSimulation('0')!
  const shipClass = svb.engine.ship.SHIP_CLASS.FIGHTER
  const ships = [{ shipClass, id: 'meh', x: 50, y: 300, rotation: 90 }]
  const ais = [{ aid: ai.id, sid: 'meh' }]
  const enemy = getMissionEnemy(mission, 'yellow')
  return new Promise<boolean>(resolve => {
    desktop.apps.add({
      name: 'Fight',
      id: 'Fight',
      zIndex: 1,
      fullscreen: { position, size },
      render: (
        <Fight
          team="green"
          enemy={enemy}
          fleet={{ ships, ais }}
          mission={mission}
          ais={[ai]}
          onEnd={() => console.log('=> [Tutorial] Ended')}
          onStart={() => console.log('=> [Tutorial] Started')}
          Ended={<BrilliantVictory onClick={() => resolve(true)} />}
        />
      ),
    })
  })
}

const onStartEditing = (ai: AI, desktop: Desktop.Handler) => {
  const width = window.innerWidth - 400 - 12 - 12 - 12
  const height = window.innerHeight - Movable.TOP_SPACE - 24
  const left = window.innerWidth - width - 12
  const position = { top: 12, left }
  const size = { height, width }
  desktop.apps.add({
    name: `Editor — ${ai.file.path}`,
    id: 'Editor',
    zIndex: 1,
    // fullscreen: { position, size },
    render: <AiEditor aid={ai.id} />,
  })
}

const Loader = () => (
  <Column flex={1} align="center" justify="center">
    <ActivityIndicator />
  </Column>
)

const Stats = ({ editor }: { editor: any }) => {
  const [pos, setPos] = useState({ lineNumber: 0, column: 0 })
  useEffect(() => {
    const fun = () => {
      const position = editor.current?.editor.current?.getPosition()
      if (position) setPos(position)
    }
    document.addEventListener('keyup', fun)
    document.addEventListener('click', fun)
    return () => {
      document.removeEventListener('keyup', fun)
      document.removeEventListener('click', fun)
    }
  }, [])
  return (
    <Row gap="m" className={styles.wc}>
      <div>
        {pos.lineNumber}:{pos.column}
      </div>
    </Row>
  )
}

const AiEditor = ({ aid }: { aid: string }) => {
  const [loading, setLoading] = useState(false)
  const dispatch = store.useDispatch()
  const ai = store.useSelector(store.selectors.ai(aid))
  const { formatOnSave, toggle } = lib.editor.useFormatOnSave()
  const ed = useRef<Monaco.Handler>(null)
  // prettier-ignore
  const saveFile = useCallback(async (file: lib.editor.File) => {
    if (ai) return await dispatch(store.actions.ai.updateAI({ ...ai, file }))
  },[ai])
  // prettier-ignore
  const saveAndCompileFile = useCallback(async (file: lib.editor.File) => {
    try {
      setLoading(true)
      const newAI = await saveFile(file)
      if (newAI) await dispatch(store.actions.ai.compileAI(newAI))
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [saveFile])
  const format = useCallback(() => ed.current?.format(), [])
  const up =
    ai?.updatedAt &&
    ai?.updatedAt !== ai?.createdAt &&
    lib.dates.toLocale(new Date(ai.updatedAt))
  if (!ai) return <Loader />
  const cl = styles.loader
  return (
    <div style={{ height: 'calc(100% - 30px)' }}>
      <Monaco.Monaco
        ref={ed}
        file={ai.file}
        formatOnSave={formatOnSave}
        onChange={saveFile}
        onSave={saveAndCompileFile}
      />
      <Row
        height={30}
        background="var(--eee)"
        align="center"
        justify="flex-end"
        gap="l"
        style={{ paddingRight: 'var(--s)' }}
      >
        <Stats editor={ed} />
        <Row flex={1} />
        <Row align="center" gap="s">
          <Checkbox checked={formatOnSave} onChange={toggle} />
          <div className={styles.updatedAt}>{s.pages.editor.formatOnSave}</div>
          <Button primary tiny onClick={format} text={s.pages.editor.format} />
        </Row>
        <Row align="center" gap="s">
          {loading && <img className={cl} src={loader} alt="Loader" />}
          {!loading && up && <img className={cl} src={valid} alt="Valid" />}
          {!loading && !up && <img className={cl} src={error} alt="Error" />}
          {up && <div className={styles.updatedAt}>{up}</div>}
          <Button
            primary
            tiny
            onClick={() => saveAndCompileFile(ai.file)}
            text={s.pages.editor.compile}
          />
        </Row>
      </Row>
    </div>
  )
}

const Intro = () => {
  const desktop = useDesktop()
  // const ais = store.useSelector(store.selectors.ais)
  const [lastMission, setLastMission] = useState(0)
  if (!lessons[lastMission]) return null
  return (
    <Conversation
      key={lastMission}
      lesson={lessons[lastMission]}
      onStartFight={async () => onStartFight(desktop)}
      onNext={() => {
        setLastMission(l => l + 1)
        const dims = dimensions()
        const apps = desktop.apps.get()
        const newApps = onResize(true)(dims, apps)
        desktop.apps.replace(newApps)
      }}
    />
  )
}

export const Tutorial = () => {
  const resizer = useCallback(onResize(false), [])
  const desktop = useRef<Desktop.Handler>(null)
  useResize(dims => {
    if (desktop.current) {
      const current = desktop.current.apps.get()
      const apps = resizer(dims, current)
      desktop.current.apps.replace(apps)
    }
  })
  return (
    <Desktop.Desktop
      ref={desktop}
      apps={{
        name: 'Tutorial',
        id: 'Tutorial',
        zIndex: 1,
        fullscreen: true,
        render: <Intro />,
      }}
    />
  )
}
