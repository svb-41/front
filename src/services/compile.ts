import { URL } from '../envs'

export type Compile = { code: string; uid: string; name: string }
export const compile = async (params: Compile): Promise<string> => {
  const { code, uid, name } = params
  const body = JSON.stringify({ code, uid, name })
  const res = await fetch(`${URL}/`, { method: 'POST', body })
  return await res.text()
}
