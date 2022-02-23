import { useState, useRef, useEffect } from 'react'
import Editor, { OnChange } from '@monaco-editor/react'
import styles from './monaco.module.css'
import tsLogo from './ts.svg'
import jsLogo from './js.svg'
import cross from './cross.svg'
import * as helpers from '@/helpers'
import { v4 as uuid } from 'uuid'

const empty =
  'empty-file-no-one-will-find-or-you-read-the-dev-tools-you-cheater'
const emptyFile: File = {
  language: 'typescript',
  code: '',
  path: empty,
  id: empty,
}

export type Files = { [id: string]: File }
export type File = {
  language: 'typescript' | 'javascript'
  path: string
  code: string
  id: string
}

const getExtension = (name: string) => {
  const [extension] = name.split('.').reverse()
  return extension
}

const getLanguage = (name: string) => {
  const extension = getExtension(name)
  return extension === 'ts' ? 'typescript' : 'javascript'
}

const getLogo = (name: string) => {
  const extension = getExtension(name)
  const logo = extension === 'ts' ? tsLogo : jsLogo
  const alt = extension === 'ts' ? 'typescript' : 'javascript'
  return [logo, alt]
}

type TabItemProps = {
  name: string
  active?: boolean
  onClick: (value: string) => void
  onClose: (value: string) => void
}
const TabItem = ({ name, active, onClick, ...props }: TabItemProps) => {
  const clName = active ? styles.tabActive : styles.tab
  const [logo, alt] = getLogo(name)
  const onClose = () => props.onClose(name)
  return (
    <div className={clName} onClick={() => onClick(name)}>
      <div className={styles.tabItemName}>
        <img src={logo} alt={alt} className={styles.languageLogo} />
        {name}
      </div>
      <img src={cross} alt="close" className={styles.close} onClick={onClose} />
    </div>
  )
}

type TabsProps = {
  active: string
  items: string[]
  onTabClick: (value: string) => void
  onTabClose: (value: string) => void
}
const Tabs = ({ active, items, onTabClick, onTabClose }: TabsProps) => (
  <div className={styles.tabs}>
    {items.map(item => {
      return (
        <TabItem
          key={item}
          name={item}
          active={item === active}
          onClick={onTabClick}
          onClose={onTabClose}
        />
      )
    })}
  </div>
)

type MenuItemProps = { name: string; onClick: (value: string) => void }
const MenuItem = ({ name, onClick }: MenuItemProps) => {
  const [logo, alt] = getLogo(name)
  return (
    <div className={styles.menuItem} onClick={() => onClick(name)}>
      <img src={logo} alt={alt} className={styles.languageLogo} />
      {name}
    </div>
  )
}

type MenuProps = {
  templates: string[]
  items: string[]
  onItemClick: (value: string) => void
}
const Menu = ({ items, templates, onItemClick }: MenuProps) => {
  return (
    <div className={styles.menu}>
      <div className={styles.menuTitle}>templates</div>
      <div>
        {templates.map(i => {
          return <MenuItem key={i} name={i} onClick={onItemClick} />
        })}
      </div>
      <div className={styles.menuTitle}>saved</div>
      <div>
        {items.map(item => {
          return <MenuItem key={item} name={item} onClick={onItemClick} />
        })}
      </div>
    </div>
  )
}

export type Props = { files: Files; onChange: (files: Files) => void }
export const Monaco = (props: Props) => {
  const codeRef = useRef()
  const [tabs, setTabs] = useState<string[]>([])
  const [active, setActive] = useState<string>(empty)
  const onTabClose = (value: string) => {
    setTabs(tabs => {
      const newTabs = tabs.filter(t => t !== value)
      setActive(act => (act === value ? newTabs[0] ?? empty : act))
      return newTabs
    })
  }
  const onItemClick = (value: string) => {
    const { files, onChange } = props
    setTabs(tabs => (tabs.includes(value) ? tabs : [...tabs, value]))
    const language = getLanguage(value)
    const path = value
    const f = files[value]
    const val = f?.code
    const v = val ?? (active === empty ? files[empty].code : '')
    const file: File = { language, code: v, path, id: uuid() }
    const newEmpty = active === empty ? emptyFile : files[empty]
    const final = { ...files, [value]: file, [empty]: newEmpty }
    onChange(final)
    setActive(value)
  }
  const onChange: OnChange = code => {
    const { files, onChange } = props
    const file = { ...files[active], value: code ?? '' }
    const final = { ...files, [active]: file }
    onChange(final)
  }
  useEffect(() => {
    const fun = (event: KeyboardEvent) => {
      const containsKey = ['S', 's'].includes(event.key)
      const isCmd = helpers.keyboard.isCmd(event)
      if (containsKey && isCmd) event.preventDefault()
    }
    document.addEventListener('keydown', fun)
    return () => document.removeEventListener('keydown', fun)
  }, [])
  // useEffect(() => {
  //   const fun = (event: KeyboardEvent) => {
  //     const containsKey = ['W', 'w'].includes(event.key)
  //     const isCmd = helpers.keyboard.isCmd(event)
  //     if (containsKey && isCmd) {
  //       event.preventDefault()
  //       if (active !== empty) onTabClose(active)
  //     }
  //   }
  //   document.addEventListener('keydown', fun)
  //   return () => document.removeEventListener('keydown', fun)
  // }, [active])
  return (
    <div className={styles.grid}>
      <Tabs
        items={tabs}
        active={active}
        onTabClick={setActive}
        onTabClose={onTabClose}
      />
      <Menu
        templates={['assault.ts', 'dance.ts', 'forward.js', 'hold.js']}
        items={Object.keys(props.files).filter(t => t !== empty)}
        onItemClick={onItemClick}
      />
      <Editor
        value={props.files[active]?.code}
        path={props.files[active]?.path}
        defaultLanguage={props.files[active]?.language}
        defaultValue={props.files[active]?.code}
        theme="vs-dark"
        onMount={(editor, _monaco) => (codeRef.current = editor)}
        onChange={onChange}
        className={styles.monaco}
      />
    </div>
  )
}
