import { useRef, useEffect } from 'react'
import Editor, { OnChange } from '@monaco-editor/react'
import core from '@svb-41/core/types'
import types from '@svb-41/engine/types'
import styles from './monaco.module.css'
import loader from '@/assets/icons/loader.gif'
import { AI } from '@/lib/ai'
import prettier from 'prettier'
import tomorrow from 'monaco-themes/themes/Tomorrow-Night-Eighties.json'

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
  onSave: (offset?: number) => Promise<{
    result?: prettier.CursorResult
    newAI?: AI
  } | void>
}
export const Monaco = (props: Props) => {
  const codeRef = useRef<any>()
  const onChange: OnChange = code => {
    const { file, onChange } = props
    if (file) onChange({ ...file, code: code ? code : file.code })
  }
  useEffect(() => {
    const remeasure = (times = 0) => {
      if (times >= 10) return
      if (codeRef.current?.remeasureFonts) {
        codeRef.current.remeasureFonts()
      } else {
        setTimeout(() => remeasure(times + 1), 5000)
      }
    }
    document.fonts.ready.then(() => remeasure())
  }, [])
  const onMount = (editor: any, monaco: any) => {
    editor.updateOptions({ scrollBeyondLastLine: false })
    editor.getModel().updateOptions({ tabSize: 2 })
    setTimeout(() => monaco.editor.remeasureFonts(), 1000)
    monaco.editor.defineTheme('tomorrow', tomorrow)
    monaco.editor.setTheme('tomorrow')
    codeRef.current = editor
    const engine = '@svb-41/engine.d.ts'
    const coreDecl = '@svb-41/core.d.ts'
    monaco.languages.typescript.typescriptDefaults.addExtraLib(types, engine)
    monaco.languages.typescript.typescriptDefaults.addExtraLib(core, coreDecl)
  }
  const { onSave } = props
  useEffect(() => {
    const handler = async (event: KeyboardEvent) => {
      const isCmdCtrl = event.ctrlKey || event.metaKey
      if (event.key === 's' && isCmdCtrl) {
        const model = codeRef.current.getModel()
        const position = codeRef.current.getPosition()
        const offset = model.getOffsetAt(position)
        event.preventDefault()
        const res = await onSave(offset)
        if (res?.newAI?.file?.code) {
          codeRef.current.setValue(res.newAI.file.code)
        }
        if (res?.result?.cursorOffset) {
          const afterPos = model.getPositionAt(res.result.cursorOffset)
          codeRef.current.setPosition(afterPos)
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onSave])
  return (
    <Editor
      value={props.file?.code}
      path={props.file?.path}
      defaultLanguage={props.file?.language}
      defaultValue={props.file?.code}
      theme="vs-dark"
      onMount={onMount}
      onChange={onChange}
      className={styles.monaco}
      options={{
        fontFamily: 'Unifont',
        fontSize: 14,
        'semanticHighlighting.enabled': true,
      }}
      loading={<img className={styles.loader} src={loader} alt="Loader" />}
    />
  )
}
