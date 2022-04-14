import { URL } from '../envs'

export const sync = async (accessToken: string, body: any) => {
  const response = await fetch(`${URL}/data/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  })
  if (response.ok) return response.json()
  return null
}

export const fetchData = async (accessToken: string) => {
  const headers = { Authorization: `Bearer ${accessToken}` }
  const response = await fetch(`${URL}/data/fetch`, { headers })
  if (response.ok) return response.json()
  return null
}
