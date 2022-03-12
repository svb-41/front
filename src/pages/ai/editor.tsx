import { useState, useEffect, useRef } from 'react'
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

const NameInput = ({ path, updatePath, rename, logo, alt }: any) => {
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

const CompileStatus = ({ updatedAt, onClick, loading }: any) => {
  return (
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
}

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
  const save = async (file: Monaco.File) => {
    const action = ai ? updateAI({ ...ai, file }) : createAI(id)
    await dispatch(action)
    setFile(file)
  }
  const compile = async () => {
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
  const updatedAt =
    ai?.updatedAt &&
    ai?.updatedAt !== ai?.createdAt &&
    toLocale(new Date(ai.updatedAt))
  const updatePath = setPath
  return { file, path, save, compile, rename, updatedAt, logo, alt, updatePath }
}

export const AIEditor = () => {
  const location = useLocation()
  const search = location.pathname.split('/')
  const id = search[search.length - 1]
  const ai = useAI(id)
  const [loading, setLoading] = useState(false)
  const onClick = async () => {
    setLoading(true)
    await ai.compile().catch(console.error)
    setLoading(false)
  }
  return (
    <HUD>
      <div className={styles.header}>
        <NameInput {...ai} />
        <CompileStatus {...ai} loading={loading} onClick={onClick} />
      </div>
      <div className={styles.monaco} style={{ background: '#1e1e1e' }}>
        <Monaco.Monaco onChange={ai.save} file={ai.file} onSave={onClick} />
      </div>
    </HUD>
  )
}
