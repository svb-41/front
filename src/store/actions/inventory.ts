import { Effect } from '@/store/types'
import { getInventory } from '@/services/inventory'
import { Stuff } from '@/store/reducers/inventory'

export const LOAD = 'inventory/LOAD'

export const loadInventory: (token: string) => Effect<void> = (
  token: string
) => {
  return async dispatch => {
    const res = await getInventory({ token })
    if (res) {
      const { items, favoritesItems, inventory } = res
      const parsedInventory = inventory.map(inv => ({
        ...inv,
        ownStats: inv.ownStats ? JSON.parse(inv.ownStats) : undefined,
      }))
      const itemsInv: Stuff[] = items.map(
        id => parsedInventory.find(s => s.id === id)!!
      )
      dispatch({ type: LOAD, items: itemsInv, favoritesItems })
    }
  }
}
