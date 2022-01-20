import { v4 } from 'uuid'
const UID_KEY = 'uid'
const USER_KEY = 'user'

export type StoredData = {
  missions: Array<string>
  ships: Array<string>
}

export const getUid = (): string => {
  const uid = localStorage.get(UID_KEY)
  if (uid) return uid
  else {
    const newUid = v4()
    localStorage.setItem(UID_KEY, newUid)
    return newUid
  }
}

export const getUser = (uid: string): StoredData | undefined => {
  const userData = localStorage.get(`${USER_KEY}-${uid}`)
  if (userData) return JSON.parse(userData)
}

export const setUser = (uid: string, data: StoredData) =>
  localStorage.setItem(`${USER_KEY}-${uid}`, JSON.stringify(data))
