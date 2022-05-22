const ACCOUNTS_KEY = 'svb41.connected-accounts'

export type Account = {
  username: string
  identicon: boolean
  uid: string
}

export const read = (): Account[] => {
  const data = localStorage.getItem(ACCOUNTS_KEY)
  if (data) return JSON.parse(data)
  return []
}

export const write = (data: Account[]) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(data))
}

export const addUser = (username: string, uid: string, identicon: boolean) => {
  const data = read()
  const newData = [...data, { username, identicon, uid }]
  const asStr = JSON.stringify(newData)
  localStorage.setItem(ACCOUNTS_KEY, asStr)
}

export const replaceUser = (
  username: string,
  oldId: string,
  uid: string,
  identicon: boolean
) => {
  const data = read()
  const idx = data.findIndex(u => u.uid === oldId)
  if (idx < 0) return addUser(username, uid, identicon)
  data[idx] = { username, uid, identicon }
  const asStr = JSON.stringify(data)
  localStorage.setItem(ACCOUNTS_KEY, asStr)
}

export const lastNumber = () => {
  const data = read()
  const set = new Set<number>()
  for (const { username } of data) {
    const ret = username.match(/Guest ([0-9]+)/)
    if (ret) set.add(parseInt(ret[1]))
  }
  let count = 1
  while (set.has(count)) count += 1
  return count
}

export const addGuest = (uid: string) => {
  const num = lastNumber()
  addUser(`Guest ${num}`, uid, false)
}
