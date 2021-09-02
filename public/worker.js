const params = location.search
  .slice(1)
  .split('&')
  .map(str => {
    const splitted = str.split('=')
    return { id: splitted[0], value: splitted[1] }
  })
  .reduce((acc, val) => ({ ...acc, [val.id]: val.value }), {})

onmessage = function (event) {
  postMessage({
    type: 'step',
    res: JSON.stringify({ id: 'THRUST', arg: 0.01 }),
  })
}
