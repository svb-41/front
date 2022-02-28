import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Editor, { OnChange } from '@monaco-editor/react'
import styles from './monaco.module.css'
import tsLogo from './ts.svg'
import jsLogo from './js.svg'
import cross from './cross.svg'

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

export type Props = { file?: File; onChange: (file: File) => void }
export const Monaco = (props: Props) => {
  const codeRef = useRef()
  const navigate = useNavigate()
  const [active, setActive] = useState<string>(empty)
  const [tabs, setTabs] = useState<string[]>([])

  const onChange: OnChange = code => {
    const { file, onChange } = props
    if (file) onChange({ ...file, code: code ? code : file.code })
  }
  useEffect(() => {
    if (props.file) {
      setActive(props.file.path)
      if (props.file.path) setTabs([props.file.path])
    }
    return () => {}
  }, [props])

  return (
    <div className={styles.grid}>
      <Tabs
        items={tabs}
        active={active}
        onTabClick={setActive}
        onTabClose={() => {
          navigate('/ai')
        }}
      />
      <Editor
        value={props.file?.code}
        path={props.file?.path}
        defaultLanguage={props.file?.language}
        defaultValue={props.file?.code}
        theme="vs-dark"
        onMount={(editor, _monaco) => (codeRef.current = editor)}
        onChange={onChange}
        className={styles.monaco}
      />
    </div>
  )
}
