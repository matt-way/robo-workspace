import { random } from 'lodash'

export const run = (state, { io }) => {
  io.position = [random(0, 1, true), random(0, 1, true)]
  
  io.history = []
  io.historySize = 50
}

export const update = (state, { io }) => {
  const { position, motion, history, historySize } = io
  const stepSize = 0.02
  // take the actuator values and update the system
  position[0] += motion[0] * stepSize
  position[0] = Math.min(1, Math.max(0, position[0]))
  position[1] += motion[1] * stepSize
  position[1] = Math.min(1, Math.max(0, position[1]))
  
  history.push([position[0], position[1]])
  if(history.length > historySize){ history.shift() }
}
