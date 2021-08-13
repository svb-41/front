export const get = (): Gamepad[] => {
  const gamepads = [...window.navigator.getGamepads()]
  return gamepads.filter(gamepad => gamepad) as Gamepad[]
}
