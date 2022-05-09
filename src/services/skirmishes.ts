import { URL } from '@/envs'

export const save = async (
  fleets: { [id: string]: string | null },
  accessToken: string
) => {
  const body = JSON.stringify({ fleets })
  const headers = { Authorization: `Bearer ${accessToken}` }
  const options = { method: 'post', headers, body }
  const result = await fetch(`${URL}/skirmishes`, options)
  return result.json()
}

export const fight = async (
  username: string,
  size: string,
  accessToken: string
) => {
  if (username.length > 0) {
    const options = { headers: { Authorization: `Bearer ${accessToken}` } }
    const endpoint = `${URL}/skirmishes/${username}?size=${size}`
    const result = await fetch(endpoint, options)
    return result.json()
  }
  return null
}

export const get = async (username: string, accessToken: string) => {
  if (username.length > 0) {
    const options = { headers: { Authorization: `Bearer ${accessToken}` } }
    const endpoint = `${URL}/skirmishes/fetch`
    const result = await fetch(endpoint, options)
    return result.json()
  }
  return null
}

export const profile = async (username: string) => {
  if (username.length > 0) {
    const endpoint = `${URL}/user/${username}`
    const result = await fetch(endpoint, {})
    return result.json()
  }
  return null
}

export type Stats = { victories: number; defeats: number }
export const updateStats = async (
  { victories, defeats }: Stats,
  accessToken: string
) => {
  const body = JSON.stringify({ victories, defeats })
  const headers = { Authorization: `Bearer ${accessToken}` }
  const options = { method: 'post', headers, body }
  const result = await fetch(`${URL}/stats`, options)
  return result.json()
}

export const getStats = async (accessToken: string): Promise<Stats | null> => {
  const headers = { Authorization: `Bearer ${accessToken}` }
  const options = { method: 'get', headers }
  const result = await fetch(`${URL}/stats`, options)
  const data = await result.json()
  if (data) return { victories: data.victories, defeats: data.defeats }
  return data
}
