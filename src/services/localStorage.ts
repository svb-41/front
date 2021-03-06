import { v4 } from 'uuid'
import { AI } from '@/lib/ai'
import { Color } from '@/lib/color'

const AI_KEY = 'ai'
const UID_KEY = 'uid'
const USER_KEY = 'user'
const FAVORITE_AIS_KEY = 'favorite-ais'

export type StoredData = {
  missions: Array<string>
  ships: Array<string>
  ais: Array<string>
  favoriteAIS: Array<string>
  color: Color
  tags: { [key: string]: string }
  fleetConfigs: any
  skirmishes: any
  preferedFleet?: string
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

export const setUserId = (uid: string) => localStorage.setItem(UID_KEY, uid)

export const getAI = (uid: string): AI | undefined => {
  const aiData = localStorage.getItem(`${AI_KEY}-${uid}`)
  if (aiData) return JSON.parse(aiData)
}

export const favoriteAIS = (): string[] => {
  const favoriteAIS = localStorage.getItem(`${FAVORITE_AIS_KEY}`)
  if (favoriteAIS) {
    return JSON.parse(favoriteAIS)
  } else {
    return []
  }
}

export const setAI = (data: AI) =>
  localStorage.setItem(`${AI_KEY}-${data.id}`, JSON.stringify(data))

export const deleteAI = (data: string) =>
  localStorage.removeItem(`${AI_KEY}-${data}`)

export const setFavoriteAIS = (favoriteAIS: string[]) => {
  localStorage.setItem(`${FAVORITE_AIS_KEY}`, JSON.stringify(favoriteAIS))
}

export const reset = () => {
  const key = 'svb-cookie-consent'
  const value = localStorage.getItem(key)
  localStorage.clear()
  if (value) localStorage.setItem(key, value)
}
