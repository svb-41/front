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
const fire = (arg, conf) => ({ id: INSTRUCTION.FIRE, arg, conf })
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
  getNewMessages: () => [],
  sendMessage: () => {},
  history: [],
}

onmessage = async function (event) {
  const data = event.data
  if (!code?.init && data.type === 'initialization') {
    try {
      initCode(data.code)
      code = code.default({ id: params.id })
      memory = data.initialMemory || {}
    } catch (e) {
      error = e.message
    }
  } else {
    if (error) {
      postMessage({ type: 'error', error })
    } else if (code) {
      try {
        const { stats, radar } = JSON.parse(data.data)
        const args = { stats, comm, radar, memory, ship: controlPanel(stats) }
        const res = code.getInstruction(args)
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
