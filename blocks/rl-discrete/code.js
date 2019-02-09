import { random } from 'lodash'

export const run = (state, { io }) => {
  io.motion = [0, 0]  
}

export const update = (state, { io }) => {
  const { motion } = io
	motion[0] = random(-1, 1, true)
  motion[1] = random(-1, 1, true)
}
