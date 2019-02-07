import { random } from "lodash"

const negFixed = (val, dec) => {
  const res = val.toFixed(dec)
  return res.indexOf('-') >= 0 ? res : ` ${res}`
}

export const run = (state, { io, domRoot }) => {
  io.canvas = document.createElement("canvas")
  io.canvas.style.border = '1px solid black'
  io.canvas.style.margin = '10px'
  io.ctx = io.canvas.getContext("2d")
  io.canvas.width = 300
  io.canvas.height = 300
  domRoot.appendChild(io.canvas)

  io.position = [random(0, 1, true), random(0, 1, true)]
  
  io.history = []
  io.historySize = 50
}

export const update = (state, { io }) => {
  const { 
    canvas, ctx, position, motion, 
    history, historySize
  } = io
  const size = 4
  const half = Math.floor(size / 2)
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  history.forEach(([x, y]) => {
  	ctx.fillRect(x * canvas.width - half, y * canvas.height - half, size, size)
  })
     
  // take the actuator values and update the system
  position[0] += motion[0]
  position[0] = Math.min(1, Math.max(0, position[0]))
  position[1] += motion[1]
  position[1] = Math.min(1, Math.max(0, position[1]))
  
  history.push([position[0], position[1]])
  if(history.length > historySize){ history.shift() }
  
  ctx.fillStyle = 'red'
  ctx.fillRect(position[0] * canvas.width - half, position[1] * canvas.height - half, size, size)
  
  ctx.fillStyle = 'rgba(0,0,0,0.5)'  
  ctx.fillText(`x: ${position[0].toFixed(2)} y: ${position[1].toFixed(2)}`, 6, 15)
  ctx.fillText(`dx: ${negFixed(motion[0], 2)} dy: ${negFixed(motion[1], 2)}`, 6, 30)
}
