import { URL } from '../envs'

export const compile = async ({
  code,
  uid,
  name,
}: {
  code: string
  uid: string
  name: string
}): Promise<string> =>
  fetch(`${URL}/`, {
    method: 'POST',
    body: JSON.stringify({ code, uid, name }),
  }).then(res => res.text())
