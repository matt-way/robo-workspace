import { random } from "lodash"

const negFixed = (val, dec) => {
  const res = val.toFixed(dec)
  return res.indexOf('-') >= 0 ? res : ` ${res}`
}

export const run = ({ state, output }) => {
  state.canvas = document.createElement("canvas")
  state.canvas.style.border = '1px solid black'
  state.canvas.style.margin = '10px'
  state.ctx = state.canvas.getContext("2d")
  state.canvas.width = 300
  state.canvas.height = 300
  output.appendChild(state.canvas)
}

export const update = ({ state, iteration }) => {
  const { 
    canvas, ctx, position, motion, history
  } = state
  const size = 4
  const half = Math.floor(size / 2)
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  history.forEach(([x, y]) => {
    const sx = Math.floor(0.5 * canvas.width)
  	const sy = Math.floor(0.7 * canvas.height)    
	  const elen = 70
 		const ex = elen * Math.cos(x * 180 * Math.PI / 180)
  	const ey = elen * Math.sin(x * 180 * Math.PI / 180)
		const flen = 70  
  	const fx = flen * Math.cos((x + y) * 180 * Math.PI / 180)
  	const fy = flen * Math.sin((x + y) * 180 * Math.PI / 180)
    const xx = sx + ex + fx
    const yy = sy - ey - fy
  	ctx.fillRect(xx - half, yy - half, size, size)
  })
  
  //ctx.fillStyle = 'red'
  //ctx.fillRect(position[0] * canvas.width - half, position[1] * canvas.height - half, size, size)
  ctx.strokeStyle = 'red'
  ctx.beginPath()
  const sx = Math.floor(0.5 * canvas.width)
  const sy = Math.floor(0.7 * canvas.height)
  ctx.moveTo(sx, sy)
  
  /*const aa = 0.5
  const bb = 0.5
  
  const elen = 70  
  const ex = elen * Math.cos(aa * 180 * Math.PI / 180)
  const ey = elen * Math.sin(aa * 180 * Math.PI / 180)
  ctx.lineTo(sx + ex, sy - ey)
  
	const flen = 70  
  const fx = flen * Math.cos((aa + bb) * 180 * Math.PI / 180)
  const fy = flen * Math.sin((aa + bb) * 180 * Math.PI / 180)
  */
    
  const elen = 70
  const ex = elen * Math.cos(position[0] * 180 * Math.PI / 180)
  const ey = elen * Math.sin(position[0] * 180 * Math.PI / 180)
  ctx.lineTo(sx + ex, sy - ey)
  
	const flen = 70  
  const fx = flen * Math.cos((position[0] + position[1]) * 180 * Math.PI / 180)
  const fy = flen * Math.sin((position[0] + position[1]) * 180 * Math.PI / 180)
  
  ctx.lineTo(sx + ex + fx, sy - ey - fy)
  ctx.stroke()
  
  ctx.fillStyle = 'rgba(0,0,0,0.5)'  
  ctx.fillText(`x: ${position[0].toFixed(2)} y: ${position[1].toFixed(2)}`, 6, 15)
  ctx.fillText(`dx: ${negFixed(motion[0], 2)} dy: ${negFixed(motion[1], 2)}`, 6, 30)
  ctx.fillText(`iteration: ${iteration}`, 6, 45)
}

