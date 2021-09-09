const params = location.search
  .slice(1)
  .split('&')
  .map(str => {
    const splitted = str.split('=')
    return { id: splitted[0], value: splitted[1] }
  })
  .reduce((acc, val) => ({ ...acc, [val.id]: val.value }), {})

let code
onmessage = function (event) {
  const data = event.data
  if (!code && data.type === 'initialization') {
    code = eval(`false||${data.code}`)
  } else {
    if (code) {
      postMessage({
        type: 'step',
        res: code(JSON.parse(data.data)),
      })
    }
  }
}
