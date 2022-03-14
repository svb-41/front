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
