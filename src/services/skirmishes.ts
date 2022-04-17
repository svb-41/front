import { URL } from '@/envs'

export const save = async (
  fleets: { small: string | null; huge: string | null },
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
