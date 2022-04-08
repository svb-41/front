import * as svb from '@svb-41/core'

type Data = {}
export const data: Data = {}
export const ai: svb.AI<Data> = ({ ship }) => {
  return ship.idle()
}
