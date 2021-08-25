import { useState, useRef, useEffect } from 'react'
import Editor, { OnChange } from '@monaco-editor/react'
import styles from './monaco.module.css'
import tsLogo from './ts.svg'
import jsLogo from './js.svg'
import cross from './cross.svg'
import * as helpers from '@/helpers'

const empty =
  'empty-file-no-one-will-find-or-you-read-the-dev-tools-you-cheater'
const emptyFile: File = { language: 'typescript', value: '', path: empty }
const savedControllersKey = 'controllers.saved'

const saveFiles = (files: Files) => {
  const value = JSON.stringify(files)
  localStorage.setItem(savedControllersKey, value)
}

const readFiles = () => {
  const value = localStorage.getItem(savedControllersKey)
  return value ? JSON.parse(value) : { [empty]: emptyFile }
}

export type Files = { [id: string]: File }
export type File = {
  language: 'typescript' | 'javascript'
  path: string
  value: string
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

export const Monaco = () => {
  const codeRef = useRef()
  const [tabs, setTabs] = useState<string[]>([])
  const [active, setActive] = useState<string>(empty)
  const [files, setFiles] = useState<Files>(readFiles())
  useEffect(() => saveFiles(files), [files])
  const onTabClose = (value: string) => {
    setTabs(tabs => {
      const newTabs = tabs.filter(t => t !== value)
      setActive(act => (act === value ? newTabs[0] ?? empty : act))
      return newTabs
    })
  }
  const onItemClick = (value: string) => {
    setTabs(tabs => (tabs.includes(value) ? tabs : [...tabs, value]))
    setFiles((files: Files) => {
      const language = getLanguage(value)
      const path = value
      const f = files[value]
      const val = f?.value
      const v = val ?? (active === empty ? files[empty].value : '')
      const file: File = { language, value: v, path }
      const newEmpty = active === empty ? emptyFile : files[empty]
      const final = { ...files, [value]: file, [empty]: newEmpty }
      return final
    })
    setActive(value)
  }
  const onChange: OnChange = code => {
    setFiles((files: Files) => {
      const file = { ...files[active], value: code ?? '' }
      const final = { ...files, [active]: file }
      return final
    })
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
        items={Object.keys(files).filter(t => t !== empty)}
        onItemClick={onItemClick}
      />
      <Editor
        value={files[active]?.value}
        path={files[active]?.path}
        defaultLanguage={files[active]?.language}
        defaultValue={files[active]?.value}
        theme="vs-dark"
        onMount={(editor, _monaco) => (codeRef.current = editor)}
        onChange={onChange}
        className={styles.monaco}
      />
    </div>
  )
}
