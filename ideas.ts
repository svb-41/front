const spawn = url => {
  const worker = new Worker(url)
  return {
    currentPromise: null,
    pending: false,
    nextInstruction: null,
    collect() {
      if (this.pending) {
        return null
      } else {
        return this.nextInstruction
      }
    },
    message(data) {
      if (this.pending) {
        return this.currentPromise
      } else {
        this.pending = true
        this.currentPromise = new Promise(resolve => {
          worker.onmessage = resolve
          worker.postMessage(data)
        }).then(msg => {
          this.pending = false
          this.currentPromise = null
          this.nextInstruction = msg
        })
      }
    },
  }
}

// controller.js
const main = async () => {
  const url = 'runner?id=001_controller.ts'
  const workers = [spawn(url)]
  // each step
  const data = {}
  const res = workers.map(w => w.message(data))
  // end of timeout
  const datas = workers.map(w => w.collect())
  // type Result = { type: 'result', result: {} }
  // type Error = { type: 'error', error }
  // datas: Array<null | Result | Error>
}

// runner
let error = null

try {
  const id = window.location.search.id
  const controllers = JSON.parse(localStorage.getItem('controllers.saved'))
  const code = controllers[id]
  const result = compile(code)
  const esModule = eval(result)
  const controller = esModule.default(ship)
} catch (e) {
  error = e
}

onmessage = event => {
  if (error) {
    postMessage({ type: 'error', error })
  } else {
    try {
      const result = controller.getInstruction(event.data)
      postMessage({ type: 'result', result })
    } catch (error) {
      postMessage({ type: 'error', error })
    }
  }
}
