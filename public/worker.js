let code = {}
let error

// eslint-disable-next-line
const params = location.search
  .slice(1)
  .split('&')
  .map(str => {
    const splitted = str.split('=')
    return { id: splitted[0], value: splitted[1] }
  })
  .reduce((acc, val) => ({ ...acc, [val.id]: val.value }), {})

const initCode = code_ => {
  code = {
    init() {
      // eslint-disable-next-line
      eval(code_)
    },
  }
  code.init()
}

onmessage = async function (event) {
  const data = event.data
  if (!code?.init && data.type === 'initialization') {
    try {
      initCode(data.code)
    } catch (e) {
      error = e.message
    }
  } else {
    if (error) {
      postMessage({ type: 'error', error })
    } else if (code) {
      try {
        const res = code.default(JSON.parse(data.data))
        postMessage({ type: 'step', res })
      } catch (e) {
        postMessage({ type: 'error', error: e.message })
      }
    } else {
      postMessage({ type: 'error', error: 'nocode' })
    }
  }
}
