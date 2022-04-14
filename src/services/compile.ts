import { URL } from '../envs'

export type Compile = { code: string; uid: string; id: string; name: string }
export const compile = async (params: Compile): Promise<string> => {
  const { code, uid, name, id } = params
  const body = JSON.stringify({ code, uid, name, id })
  const res = await fetch(`${URL}/compile`, { method: 'POST', body })
  return await res.text()
}
