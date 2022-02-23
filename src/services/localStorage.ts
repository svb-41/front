import { v4 } from 'uuid'
import { AI } from '@/store/reducers/ai'
import { Color } from '@/store/reducers/user'

const AI_KEY = 'ai'
const UID_KEY = 'uid'
const USER_KEY = 'user'

export type StoredData = {
  missions: Array<string>
  ships: Array<string>
  ais: Array<string>
  color: Color
}

export const getUid = (): string => {
  const uid = localStorage.getItem(UID_KEY)
  if (uid) return uid
  else {
    const newUid = v4()
    localStorage.setItem(UID_KEY, newUid)
    return newUid
  }
}

export const getUser = (uid: string): StoredData | undefined => {
  const userData = localStorage.getItem(`${USER_KEY}-${uid}`)
  if (userData) return JSON.parse(userData)
}

export const setUser = (uid: string, data: StoredData) =>
  localStorage.setItem(`${USER_KEY}-${uid}`, JSON.stringify(data))

export const getAI = (uid: string): AI | undefined => {
  const aiData = localStorage.getItem(`${AI_KEY}-${uid}`)
  if (aiData) return JSON.parse(aiData)
}

export const setAI = (data: AI) =>
  localStorage.setItem(`${AI_KEY}-${data.id}`, JSON.stringify(data))

export const deleteAI = (data: string) =>
  localStorage.removeItem(`${AI_KEY}-${data}`)
