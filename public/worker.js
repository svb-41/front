const params = location.search
  .slice(1)
  .split('&')
  .map(str => {
    const splitted = str.split('=')
    return { id: splitted[0], value: splitted[1] }
  })
  .reduce((acc, val) => ({ ...acc, [val.id]: val.value }), {})

let code
let error
onmessage = function (event) {
  const data = event.data
  if (!code && data.type === 'initialization') {
    try {
      code = eval(`false||${data.code}`)
    } catch (e) {
      error = e.message
    }
  } else {
    if (error) {
      postMessage({ type: 'error', error })
    } else if (code) {
      try {
        postMessage({
          type: 'step',
          res: code(JSON.parse(data.data)),
        })
      } catch (e) {
        postMessage({ type: 'error', error: e.message })
      }
    } else {
      postMessage({ type: 'error', error: 'nocode' })
    }
  }
}
