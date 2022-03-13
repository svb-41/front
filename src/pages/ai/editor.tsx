import { useState, useEffect, useRef } from 'react'
import prettier from 'prettier'
import parserTypescript from 'prettier/parser-babel'
import { HUD } from '@/components/hud'
import { useLocation } from 'react-router-dom'
import * as Monaco from '@/components/monaco'
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
import styles from './ai.module.css'

type CheckboxProps = { checked: boolean; onChange?: (value: boolean) => void }
const Checkbox = ({ checked, onChange }: CheckboxProps) => {
  return (
    <label>
      <input
        className={styles.inputCheckbox}
        type="checkbox"
        checked={checked}
        onChange={() => onChange?.(!checked)}
      />
      <div className={checked ? styles.checkedBox : styles.uncheckedBox}>
        {checked && <div className={styles.checkedMark}>x</div>}
      </div>
    </label>
  )
}

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
        className={styles.input}
        value={val}
        onChange={onChange}
        onBlur={rename}
      />
      <div className={styles.inputExtension}>.ts</div>
    </form>
  )
}

const CompileStatus = ({ updatedAt, onClick, loading }: any) => (
  <div className={styles.compileStatus}>
    {loading && <img className={styles.loader} src={loader} />}
    {!loading && updatedAt && <img className={styles.loader} src={valid} />}
    {!loading && !updatedAt && <img className={styles.loader} src={error} />}
    {updatedAt && <div className={styles.updatedAt}>{updatedAt}</div>}
    <button className={styles.compileButton} onClick={onClick}>
      Compile
    </button>
  </div>
)

const FormatStatus = ({ formatOnSave, onClick, onChange }: any) => (
  <div className={styles.compileStatus}>
    <Checkbox checked={formatOnSave} onChange={onChange} />
    <div className={styles.updatedAt}>Format on save</div>
    <button className={styles.compileButton} onClick={onClick}>
      Format
    </button>
  </div>
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
  const format = async () => {
    if (ai && formatOnSave) {
      const code = prettier.format(ai.file.code, {
        parser: 'babel',
        plugins: [parserTypescript],
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
      })
      const file = { ...ai.file, code }
      const action = updateAI({ ...ai, file })
      const newAI = await dispatch(action)
      setFile(file)
      return newAI
    }
    return ai
  }
  const save = async (file: Monaco.File) => {
    const action = ai ? updateAI({ ...ai, file }) : createAI(id)
    await dispatch(action)
    setFile(file)
  }
  const compile = async () => {
    const ai = await format()
    if (ai) {
      const action = compileAI(ai)
      await dispatch(action)
    }
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
  const [loading, setLoading] = useState(false)
  const onClick = async () => {
    setLoading(true)
    await ai.methods.compile().catch(console.error)
    setLoading(false)
  }
  return (
    <HUD>
      <div className={styles.header}>
        <NameInput {...ai} />
        <div className={styles.indicators}>
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
        </div>
      </div>
      <div className={styles.monaco} style={{ background: '#1e1e1e' }}>
        <Monaco.Monaco
          onChange={ai.methods.save}
          file={ai.data.file}
          onSave={onClick}
        />
      </div>
    </HUD>
  )
}
