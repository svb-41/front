export type Files = { [id: string]: File }
export type File = {
  language: 'typescript' | 'javascript'
  path: string
  value: string
}

export const empty =
  'empty-file-no-one-will-find-or-you-read-the-dev-tools-you-cheater'
export const emptyFile: File = {
  language: 'typescript',
  value: '',
  path: empty,
}
const savedControllersKey = 'controllers.saved'

export const saveFiles = (files: Files) => {
  const value = JSON.stringify(files)
  localStorage.setItem(savedControllersKey, value)
}

export const readFiles = () => {
  const value = localStorage.getItem(savedControllersKey)
  return value ? JSON.parse(value) : { [empty]: emptyFile }
}
