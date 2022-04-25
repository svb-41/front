import { useState, useEffect, useRef } from 'react'
import prettier from 'prettier'
import parserTypescript from 'prettier/parser-babel'
import { Main } from '@/components/main'
import { Button } from '@/components/button'
import { Row, Column } from '@/components/flex'
import { Checkbox } from '@/components/checkbox'
import { useLocation } from 'react-router-dom'
import * as Monaco from '@/components/monaco'
import { Simulation } from '@/pages/ai/simulation'
import { useSelector, useDispatch } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import { createAI, updateAI, compileAI } from '@/store/actions/ai'
import tsLogo from '@/components/monaco/ts.svg'
import jsLogo from '@/components/monaco/js.svg'
import { toLocale } from '@/helpers/dates'
import unknownLogo from '@/components/monaco/question-mark.svg'
import loader from '@/assets/icons/loader.gif'
import valid from '@/assets/icons/valid.svg'
import error from '@/assets/icons/error.svg'
import { AI } from '@/lib/ai'
import styles from './ai.module.css'
import s from '@/strings.json'

const NameInput = ({ data, methods }: any) => {
  const { path, logo, alt } = data
  const { updatePath, rename } = methods
  const inputRef = useRef<any>()
  const p = path ?? ''
  const [_, ...vals] = p.split('.').reverse()
  const val = vals.join('.')
  const onChange = (event: any) => updatePath(`${event.target.value}.ts`)
  const onSubmit = (event: any) => {
    event.preventDefault()
    inputRef.current && inputRef.current.blur()
  }
  return (
    <form className={styles.inputName} onSubmit={onSubmit}>
      <img src={logo} alt={alt} className={styles.logo} />
      <div className={styles.spacer} />
      <input
        ref={inputRef}
        size={val.length}
        className={styles.unArchivedInput}
        value={val}
        onChange={onChange}
        onBlur={rename}
      />
      <div className={styles.inputExtension}>.ts</div>
    </form>
  )
}

const CompileStatus = ({ updatedAt, onClick, loading }: any) => (
  <Row align="center" gap="s">
    {loading && <img className={styles.loader} src={loader} alt="Loader" />}
    {!loading && updatedAt && (
      <img className={styles.loader} src={valid} alt="Valid" />
    )}
    {!loading && !updatedAt && (
      <img className={styles.loader} src={error} alt="Error" />
    )}
    {updatedAt && <div className={styles.updatedAt}>{updatedAt}</div>}
    <Button
      primary
      small
      onClick={() => onClick()}
      text={s.pages.editor.compile}
    />
  </Row>
)

const FormatStatus = ({ formatOnSave, onClick, onChange }: any) => (
  <Row align="center" gap="s">
    <Checkbox checked={formatOnSave} onChange={onChange} />
    <div className={styles.updatedAt}>{s.pages.editor.formatOnSave}</div>
    <Button
      primary
      small
      onClick={() => onClick(undefined, true)}
      text={s.pages.editor.format}
    />
  </Row>
)

const getExtension = (name: string) => {
  const [extension] = name.split('.').reverse()
  return extension
}

const getLogo = (
  name?: string
): [string, 'typescript' | 'javascript' | '?'] => {
  if (name) {
    const extension = getExtension(name)
    if (extension === 'ts') return [tsLogo, 'typescript']
    if (extension === 'js') return [jsLogo, 'javascript']
  }
  return [unknownLogo, '?']
}

const useAI = (id: string) => {
  const dispatch = useDispatch()
  const [formatOnSave, setFormatOnSave] = useState<boolean>(() => {
    const value = localStorage.getItem('svb41.config.formatOnSave')
    if (value) return JSON.parse(value)
    return true
  })
  useEffect(() => {
    const value = JSON.stringify(formatOnSave)
    localStorage.setItem('svb41.config.formatOnSave', value)
  }, [formatOnSave])
  const [file, setFile] = useState<Monaco.File>()
  const [path, setPath] = useState<string>()
  const ai = useSelector(selectors.ai(id))
  const [logo, alt] = getLogo(path)
  useEffect(() => {
    if (ai) {
      setFile(ai.file)
      setPath(ai.file.path)
    }
  }, [ai])
  const format = async (
    offset?: number,
    shouldFormat?: boolean
  ): Promise<{
    result?: prettier.CursorResult
    newAI?: AI
  }> => {
    if (ai && (formatOnSave || shouldFormat)) {
      const result = prettier.formatWithCursor(ai.file.code, {
        cursorOffset: offset ?? 0,
        parser: 'babel',
        plugins: [parserTypescript],
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
      })
      const code = result.formatted
      const file = { ...ai.file, code }
      const action = updateAI({ ...ai, file })
      const newAI = await dispatch(action)
      setFile(file)
      return { result, newAI }
    }
    return {
      newAI: ai,
      result: { cursorOffset: offset ?? 0, formatted: ai?.file?.code ?? '' },
    }
  }
  const save = async (file: Monaco.File) => {
    const action = ai ? updateAI({ ...ai, file }) : createAI(id)
    await dispatch(action)
    setFile(file)
  }
  const compile = async (offset?: number) => {
    const ai = await format(offset)
    if (ai.newAI) {
      const action = compileAI(ai.newAI)
      const wait = Promise.resolve(dispatch(action))
      return { ai, wait }
    }
    return { ai, wait: Promise.resolve() }
  }
  const rename = () => {
    if (ai && path) {
      const file = { ...ai.file, path, language: alt }
      const action = updateAI({ ...ai, file })
      dispatch(action)
    }
  }
  const toggleFormat = () => setFormatOnSave(f => !f)
  const updatedAt =
    ai?.updatedAt &&
    ai?.updatedAt !== ai?.createdAt &&
    toLocale(new Date(ai.updatedAt))
  const updatePath = setPath
  const data = { file, path, logo, alt, updatedAt, formatOnSave }
  const methods = { save, compile, rename, updatePath, format, toggleFormat }
  return { data, methods }
}

export const AIEditor = () => {
  const location = useLocation()
  const search = location.pathname.split('/')
  const id = search[search.length - 1]
  const ai = useAI(id)
  const selectedAI = useSelector(selectors.ai(id))
  const [loading, setLoading] = useState(false)
  const onClick = async (offset?: number) => {
    setLoading(true)
    return ai.methods
      .compile(offset)
      .then(result => {
        if (!result) return
        result.wait.then(() => setLoading(false))
        return result.ai
      })
      .catch(console.error)
  }
  return (
    <Main>
      <div className={styles.monaco} style={{ background: '#1e1e1e' }}>
        <Column flex={3}>
          <Row
            justify="space-between"
            padding="s"
            background="var(--eee)"
            height={50}
          >
            <NameInput {...ai} />
            <Row align="center" gap="xxl">
              <FormatStatus
                formatOnSave={ai.data.formatOnSave}
                onChange={ai.methods.toggleFormat}
                onClick={ai.methods.format}
              />
              <CompileStatus
                updatedAt={ai.data.updatedAt}
                loading={loading}
                onClick={onClick}
              />
            </Row>
          </Row>
          <div className={styles.editor}>
            <Monaco.Monaco
              onChange={ai.methods.save}
              file={ai.data.file}
              onSave={onClick}
            />
          </div>
        </Column>
        <div className={styles.sidePanel}>
          {selectedAI && (
            <Simulation
              ai={selectedAI}
              beforeLaunch={async () => {
                await onClick()
              }}
            />
          )}
        </div>
      </div>
    </Main>
  )
}
