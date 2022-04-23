export enum Color {
  BLUE = 'blue',
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  WHITE = 'white',
}

export const colors = Object.values(Color)
export const random = colors
  .map(value => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value)

const nextColorInt = () => {
  const value = Math.random()
  return Math.floor(value * 255)
}

const toHex = (value: number) => {
  const hexed = value.toString(16)
  if (hexed.length === 1) return `0${hexed}`
  return hexed
}

export const generate = () => {
  const red = nextColorInt()
  const green = nextColorInt()
  const blue = nextColorInt()
  const colors = [red, green, blue].map(c => toHex(c)).join('')
  return `#${colors}`
}

export const isDark = (color: string) => {
  var c = color.substring(1) // strip #
  var rgb = parseInt(c, 16) // convert rrggbb to decimal
  var r = (rgb >> 16) & 0xff // extract red
  var g = (rgb >> 8) & 0xff // extract green
  var b = (rgb >> 0) & 0xff // extract blue
  var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b // per ITU-R BT.709
  return luma < 128
}
