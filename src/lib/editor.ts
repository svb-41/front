import { useState, useEffect, useCallback, useMemo } from 'react'
import prettier from 'prettier'
import parserTS from 'prettier/parser-typescript'

export type Files = { [id: string]: File }
export type File = {
  language: 'typescript' | 'javascript' | '?'
  path: string
  code: string
}

const key = 'svb41.config.formatOnSave'
export const useFormatOnSave = () => {
  const [formatOnSave, setFormatOnSave] = useState<boolean>(() => {
    const value = localStorage.getItem(key)
    if (value) return JSON.parse(value)
    return true
  })
  const toggle = useCallback(() => setFormatOnSave(t => !t), [])
  useEffect(() => {
    const value = JSON.stringify(formatOnSave)
    localStorage.setItem(key, value)
  }, [formatOnSave])
  return useMemo(() => {
    return { formatOnSave, setFormatOnSave, toggle }
  }, [formatOnSave, toggle])
}

export const format = async (file: File, offset?: number) => {
  const result = prettier.formatWithCursor(file.code, {
    cursorOffset: offset ?? 0,
    parser: 'typescript',
    plugins: [parserTS],
    semi: false,
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 2,
    arrowParens: 'avoid',
  })
  const code = result.formatted
  const newFile = { ...file, code }
  return { file: newFile, offset: result.cursorOffset }
}
