import { useState, useRef, useEffect } from 'react'
import Editor, { OnChange } from '@monaco-editor/react'
import styles from './monaco.module.css'
import tsLogo from './ts.svg'
import jsLogo from './js.svg'
import cross from './cross.svg'
import * as helpers from '@/helpers'
import * as templates from './templates'
import {
  File,
  Files,
  empty,
  readFiles,
  saveFiles,
  emptyFile,
} from '@/helpers/storage'

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
  onRename: (value: string) => void
}
const TabItem = ({ name, active, ...props }: TabItemProps) => {
  const clName = active ? styles.tabActive : styles.tab
  const [logo, alt] = getLogo(name)
  const onClick = () => props.onClick(name)
  const onClose = () => props.onClose(name)
  const onRename = () => props.onRename(name)
  return (
    <div
      className={clName}
      onMouseUp={event => (event.button === 1 ? onClose() : onClick())}
      onContextMenu={event => {
        event.preventDefault()
        onRename()
      }}
    >
      <div className={styles.tabItemName}>
        <img src={logo} alt={alt} className={styles.languageLogo} />
        <div className={styles.tabItemNameTitle}>{name}</div>
      </div>
      <img src={cross} alt="close" className={styles.close} onClick={onClose} />
    </div>
  )
}

type TabType = 'add' | 'file'
type TabsProps = {
  active: string
  items: string[]
  onTabClick: (type: TabType) => (value: string) => void
  onTabClose: (value: string) => void
  onTabRename: (value: string) => void
}
const Tabs = ({ active, items, ...props }: TabsProps) => (
  <div className={styles.tabs}>
    {items.map(item => (
      <TabItem
        key={item}
        name={item}
        active={item === active}
        onClick={props.onTabClick('file')}
        onClose={props.onTabClose}
        onRename={props.onTabRename}
      />
    ))}
    <div className={styles.plusTab} onClick={() => props.onTabClick('add')('')}>
      <div className={styles.tabItemNamePlus}>+</div>
    </div>
  </div>
)

type MenuItemProps = {
  name: string
  onClick: (value: string) => void
  onContextMenu?: (value: string) => void
}
const MenuItem = ({ name, onClick, onContextMenu }: MenuItemProps) => {
  const [logo, alt] = getLogo(name)
  return (
    <div
      className={styles.menuItem}
      onClick={() => onClick(name)}
      onContextMenu={event => {
        event.preventDefault()
        if (onContextMenu) onContextMenu(name)
      }}
    >
      <img src={logo} alt={alt} className={styles.languageLogo} />
      <div className={styles.menuItemTitle}>{name}</div>
    </div>
  )
}

type RenderItemsProps = {
  className?: string
  items: string[]
  onItemClick: (val: string) => void
  onItemContextMenu?: (val: string) => void
}
const RenderItems = ({ className, items, ...props }: RenderItemsProps) => (
  <div className={className}>
    {items.map(item => (
      <MenuItem
        key={item}
        name={item}
        onClick={props.onItemClick}
        onContextMenu={props.onItemContextMenu}
      />
    ))}
  </div>
)

type MenuProps = {
  templates: string[]
  items: string[]
  onItemClick: (value: string) => void
  onItemContextMenu: (value: string) => void
}
const Menu = ({ items, templates, ...props }: MenuProps) => (
  <div className={styles.menu}>
    <div className={styles.menuTitle}>templates</div>
    <RenderItems items={templates} onItemClick={props.onItemClick} />
    <div className={styles.menuTitle}>saved</div>
    <RenderItems className={styles.menuItems} items={items} {...props} />
  </div>
)

export const Monaco = () => {
  const codeRef = useRef<any>()
  const inputRef = useRef<HTMLInputElement>(null)
  const [rename, setRename] = useState({ base: '', path: '', ext: '' })
  const [modalVisible, setModalVisible] = useState(false)
  const [tabs, setTabs] = useState<string[]>([])
  const [active, setActive] = useState<string>(empty)
  const [files, setFiles] = useState<Files>(readFiles())
  const [allTemplates, setAllTemplates] = useState<templates.Template[]>([])
  useEffect(() => {
    templates.all().then(setAllTemplates)
  }, [])
  useEffect(() => saveFiles(files), [files])
  const findNewPath = (index?: number): string => {
    const newPath = 'untitled'
    const path = index ? `${newPath}-${index}` : newPath
    const finalPath = path + '.ts'
    if (files[finalPath]) {
      return findNewPath(index ? index + 1 : 1)
    } else {
      return finalPath
    }
  }
  const onTabClick = (type: TabType) => (path: string) => {
    switch (type) {
      case 'add': {
        const path = findNewPath()
        setFiles(files => {
          const language = getLanguage(path)
          const value = active === empty ? files[empty].value : ''
          const file: File = { language, value, path }
          const newEmpty = active === empty ? emptyFile : files[empty]
          const final = { ...files, [path]: file, [empty]: newEmpty }
          return final
        })
        setTabs(tabs => [...tabs, path])
        setActive(path)
        break
      }
      case 'file':
        setActive(path)
        break
    }
  }
  const onTabClose = (path: string) => {
    setTabs(tabs => {
      const newTabs = tabs.filter(t => t !== path)
      setActive(active => (active === path ? newTabs[0] ?? empty : active))
      return newTabs
    })
  }
  const onItemClick = (path: string) => {
    setTabs(tabs => (tabs.includes(path) ? tabs : [...tabs, path]))
    setFiles(files => {
      const template = allTemplates.find(t => t.path === path)
      if (template && !files[path]) {
        const language = getLanguage(path)
        const file: File = { language, value: template.content, path }
        return { ...files, [path]: file }
      } else {
        return files
      }
    })
    setActive(path)
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
  const onTabRename = (path: string) => {
    setModalVisible(true)
    const [ext, ...realPath] = path.split('.').reverse()
    setRename({ base: path, path: realPath.join('.'), ext })
  }
  useEffect(() => {
    if (modalVisible) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [modalVisible])
  return (
    <div className={styles.grid}>
      {modalVisible && (
        <div className={styles.modal}>
          <form
            className={styles.modalForm}
            onSubmit={event => {
              event.preventDefault()
              setModalVisible(false)
              setFiles(files => {
                const file = files[rename.base]
                const newPath =
                  rename.path.replace(/ /g, '-') + '.' + rename.ext
                const language = getLanguage(newPath)
                const newFile: File = { ...file, path: newPath, language }
                const files_: Files = { ...files, [newPath]: newFile }
                delete files_[rename.base]
                setActive(newPath)
                setTabs(tabs =>
                  tabs.map(t => (t === rename.base ? newPath : t))
                )
                return files_
              })
            }}
          >
            <div className={styles.renameTitle}>Rename your file</div>
            <div className={styles.modalSpacer} />
            <div className={styles.modalInput}>
              <input
                ref={inputRef}
                className={styles.inputName}
                type="text"
                value={rename.path}
                onChange={event =>
                  setRename({ ...rename, path: event.target.value })
                }
              />
              <button
                className={
                  rename.ext === 'ts'
                    ? styles.inputExtensionActive
                    : styles.inputExtension
                }
                type="button"
                onClick={() => setRename({ ...rename, ext: 'ts' })}
              >
                .ts
              </button>
              <button
                className={
                  rename.ext === 'js'
                    ? styles.inputExtensionActive
                    : styles.inputExtension
                }
                type="button"
                onClick={() => setRename({ ...rename, ext: 'js' })}
              >
                .js
              </button>
            </div>
            <div className={styles.modalSpacerS} />
            <div className={styles.submitSection}>
              <input type="submit" className={styles.inputSubmit} />
              <button
                type="button"
                className={styles.inputCancel}
                onClick={() => setModalVisible(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      <Tabs
        items={tabs}
        active={active}
        onTabClick={onTabClick}
        onTabClose={onTabClose}
        onTabRename={onTabRename}
      />
      <Menu
        templates={allTemplates.map(t => t.path)}
        items={Object.keys(files).filter(t => t !== empty)}
        onItemClick={onItemClick}
        onItemContextMenu={path => {
          const result = window.confirm('Do you want to delete ' + path + ' ?')
          if (result) {
            setFiles(files => {
              const files_: Files = { ...files }
              delete files_[path]
              return files_
            })
          }
        }}
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
