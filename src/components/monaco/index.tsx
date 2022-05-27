import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import prettier from 'prettier'
import Editor, { OnChange } from '@monaco-editor/react'
import core from '@svb-41/core/types'
import types from '@svb-41/engine/types'
import { Files, File } from '@/lib/editor'
import * as lib from '@/lib'

// Assets
import tomorrow from 'monaco-themes/themes/Tomorrow-Night-Eighties.json'
import loader from '@/assets/icons/loader.gif'
import styles from './monaco.module.css'

export type { Files, File } from '@/lib/editor'

export type Props = {
  file?: File
  formatOnSave?: boolean
  onChange: (file: File) => void
  onSave: (file: File) => void
}

export type Handler = {
  format: () => Promise<void>
  editor: { current?: any }
}

export const Monaco = forwardRef((props: Props, ref: React.Ref<Handler>) => {
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
  const format = async (file: File) => {
    const model = codeRef.current.getModel()
    const position = codeRef.current.getPosition()
    const offset = model.getOffsetAt(position)
    const result = await lib.editor.format(file, offset)
    codeRef.current.setValue(result.file.code)
    const afterPos = model.getPositionAt(result.offset)
    codeRef.current.setPosition(afterPos)
    return result
  }
  useEffect(() => {
    const handler = async (event: KeyboardEvent) => {
      const isCmdCtrl = event.ctrlKey || event.metaKey
      if (event.key === 's' && isCmdCtrl && props.file) {
        event.preventDefault()
        if (props.formatOnSave) {
          const result = await format(props.file)
          onSave(result.file)
        } else {
          onSave(props.file)
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onSave])
  useImperativeHandle(
    ref,
    () => ({
      format: async () => {
        if (props.file) {
          const result = await format(props.file)
          props.onChange(result.file)
        }
      },
      editor: codeRef,
    }),
    [props.file]
  )
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
})
