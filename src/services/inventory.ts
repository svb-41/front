import { URL } from '../envs'
import { Stuff } from '@/store/reducers/inventory'

export type InventoryParams = { token: string }
export type Inventory = {
  items: string[]
  favoritesItems: string[]
  inventory: Stuff[]
}
export const getInventory = async (
  params: InventoryParams
): Promise<Inventory | null> => {
  const { token } = params
  const res = await fetch(`${URL}/inventory`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.ok) return await res.json()
  return null
}
