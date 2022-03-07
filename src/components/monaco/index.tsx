import { useRef, useEffect } from 'react'
import Editor, { OnChange } from '@monaco-editor/react'
import core from './core'
import styles from './monaco.module.css'

export type Files = { [id: string]: File }
export type File = {
  language: 'typescript' | 'javascript' | '?'
  path: string
  code: string
  id: string
}

export type Props = {
  file?: File
  onChange: (file: File) => void
  onSave: () => void
}
export const Monaco = (props: Props) => {
  const codeRef = useRef()
  const onChange: OnChange = code => {
    const { file, onChange } = props
    if (file) onChange({ ...file, code: code ? code : file.code })
  }
  const onMount = (editor: any, monaco: any) => {
    editor.updateOptions({ scrollBeyondLastLine: false })
    editor.getModel().updateOptions({ tabSize: 2 })
    codeRef.current = editor
    const file = '@starships/core.d.ts'
    monaco.languages.typescript.typescriptDefaults.addExtraLib(core, file)
  }
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isCmdCtrl = event.ctrlKey || event.metaKey
      if (event.key === 's' && isCmdCtrl) {
        event.preventDefault()
        props.onSave()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [props.onSave])

  return (
    <div className={styles.grid}>
      <Editor
        value={props.file?.code}
        path={props.file?.path}
        defaultLanguage={props.file?.language}
        defaultValue={props.file?.code}
        theme="vs-dark"
        onMount={onMount}
        onChange={onChange}
        className={styles.monaco}
      />
    </div>
  )
}
