export const run = (state, { io, domRoot }) => {
	io.canvas = document.createElement('canvas')
  io.canvas.style.border = '1px solid black'
  io.canvas.style.margin = '10px'
  io.ctx = io.canvas.getContext("2d")
  io.canvas.width = 300
  io.canvas.height = 300
  domRoot.appendChild(io.canvas)
}

export const update = (state, { io }) => {
  const { canvas, ctx, graph } = io
  const size = 4
  const half = Math.floor(size / 2)
  
  graph.forEachNode(function(node){
    const { feature } = node.data
    ctx.fillStyle = 'red'
	  ctx.fillRect(feature[0] * canvas.width - half, feature[1] * canvas.height - half, size, size)
	})
}
