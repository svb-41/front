let code = {}
let error
let memory

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

const INSTRUCTION = {
  DEFAULT: 'DEFAULT',
  IDLE: 'IDLE',
  TURN: 'TURN',
  FIRE: 'FIRE',
  THRUST: 'THRUST',
}
const idle = () => ({ id: INSTRUCTION.IDLE })
const turn = arg => ({ id: INSTRUCTION.TURN, arg })
const thrust = arg => ({ id: INSTRUCTION.THRUST, arg })
const fire = (arg, target) => ({ id: INSTRUCTION.FIRE, arg, target })
const controlPanel = ship => ({
  idle: () => idle(),
  turn: arg => turn(arg ? arg : ship.stats.turn),
  turnRight: arg => turn(arg ? -arg : -ship.stats.turn),
  turnLeft: arg => turn(arg ? arg : ship.stats.turn),
  fire: (arg, target) => fire(arg ? arg : 0, target),
  thrust: arg => thrust(arg ? arg : ship.stats.acceleration),
})

//TODO comm
const comm = {
  messagesSince: () => [],
  sendMessage: message => {
    postMessage({
      type: 'comm',
      message: {
        timeSend: Date.now(),
        content: { sender: params.id, message },
      },
    })
  },
  history: [],
}

onmessage = async function (event) {
  const data = event.data
  if (!code?.init && data.type === 'initialization') {
    try {
      initCode(data.code)
      memory = code.data || code.initialData || {}
      code = code.ai || code.default
    } catch (e) {
      error = e.message
    }
  } else {
    if (error) {
      postMessage({ type: 'error', error })
    } else if (code) {
      try {
        const { stats, radar, messages } = JSON.parse(data.data)
        comm.messagesSince = () => messages
        const args = { stats, comm, radar, memory, ship: controlPanel(stats) }
        const res = code(args)
        postMessage({ type: 'step', res })
      } catch (e) {
        console.error(e)
        postMessage({ type: 'error', error: e.message })
      }
    } else {
      postMessage({ type: 'error', error: 'nocode' })
    }
  }
}
