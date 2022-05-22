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

export type ResponseAIS = {
  [key: string]: {
    createdAt: string
    path: string
    language: string
    updatedAt: string
    tags: Array<string>
    description?: string
  }
}
export type ResponseFetchData = {
  preferences: {
    color: string
    unlockedMissions: Array<string>
    favoritesAI: Array<string>
    ais: Array<string>
    fleetConfigs: Array<string>
    unlockedShips: Array<string>
    tags: { [key: string]: string }
    onboarded: boolean
  }
  fleetSkirmishes: { small: string | null; huge: string | null }
  ais: ResponseAIS
  fleetConfigs: { [key: string]: string }
}
export const fetchData = async (
  accessToken: string
): Promise<ResponseFetchData | null> => {
  const headers = { Authorization: `Bearer ${accessToken}` }
  const response = await fetch(`${URL}/data/fetch`, { headers })
  if (response.ok) return response.json()
  return null
}
