import { useState, useEffect } from 'react'
import * as HUD from '@/components/hud'
import { useLocation } from 'react-router-dom'
import * as Monaco from '@/components/monaco'
import { useSelector, useDispatch } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import Input from '@/components/input'
import Button from '@/components/button'
import { createAI, updateAI, compileAI } from '@/store/actions/ai'
import tsLogo from '@/components/monaco/ts.svg'
import jsLogo from '@/components/monaco/js.svg'
import unknownLogo from '@/components/monaco/question-mark.svg'

import styles from './ai.module.css'

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

const Mission = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const search = location.pathname.split('/')
  const id = search[search.length - 1]
  const ai = useSelector(selectors.ai(id))
  const [file, setFile] = useState<Monaco.File>()
  const [path, setPath] = useState<string>()
  const [logo, alt] = getLogo(path)

  const saveFile = (file: Monaco.File) => {
    if (ai) dispatch(updateAI({ ...ai, file }))
    else dispatch(createAI(id))
    setFile(file)
  }

  useEffect(() => {
    if (ai) {
      setFile(ai.file)
      setPath(ai.file.path)
    }
  }, [ai])

  const compile = () => {
    if (ai) dispatch(compileAI(ai))
  }

  const rename = () => {
    if (ai && path)
      dispatch(updateAI({ ...ai, file: { ...ai.file, path, language: alt } }))
  }

  const displayUpdatedAt = () => {
    if (ai) {
      if (typeof ai.updatedAt === 'string') return ai.updatedAt
      return ai.updatedAt.toISOString()
    }
    return ''
  }
  return (
    <>
      <HUD.HUD title="Artificial intelligence" back="/ai" />
      <HUD.Container>
        <div className={styles.header}>
          <div className={styles.input}>
            <Input value={path} onChange={setPath} onSubmit={rename} />
            <img src={logo} alt={alt} className={styles.languageLogo} />
          </div>
          <div className={styles.input}>
            <div> {displayUpdatedAt()}</div>
            <Button text="compile" onClick={compile} color="green" />
          </div>
        </div>
        <Monaco.Monaco onChange={saveFile} file={file} onSave={compile} />
      </HUD.Container>
    </>
  )
}

export default Mission
