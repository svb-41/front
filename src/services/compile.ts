import { URL } from '../envs'

export type Compile = { code: string; uid: string; id: string; name: string }
export const compile = async (params: Compile): Promise<string> => {
  const { code, uid, name, id } = params
  const body = JSON.stringify({ code, uid, name, id })
  const res = await fetch(`${URL}/compile`, { method: 'POST', body })
  return await res.text()
}

export type AIparams = { uid: string; id: string; token?: string }
export const getAI = async (params: AIparams) => {
  const { uid, id, token } = params
  const queryStringParameters = [
    ['uid', uid],
    ['id', id],
    ['decompiled', token !== undefined],
  ]
    .map(a => a.join('='))
    .join('&')
  const res = await fetch(`${URL}/ai?${queryStringParameters}`, {
    method: 'GET',
  })
  return await res.json()
}
