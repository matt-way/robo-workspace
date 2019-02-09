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
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  graph.forEachNode(function(node){
    const { feature } = node.data
    const sx = feature[0] * canvas.width
    const sy = feature[1] * canvas.height
    
    // draw the links
    /*var avgIncidence = 0    
    graph.forEachLinkedNode(node.id, function(linkedNode, link){
      avgIncidence += link.data.incidence
    })
    avgIncidence /= node.links.length
    */
    
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    graph.forEachLinkedNode(node.id, function(linkedNode, link){
      // only draw useful links      
      //if(link.data.incidence > 0.1 * avgIncidence){
      	const tFeature = linkedNode.data.feature
				const tx = tFeature[0] * canvas.width
      	const ty = tFeature[1] * canvas.height
	      
	      ctx.beginPath()
				ctx.moveTo(sx, sy)
				ctx.lineTo(tx, ty)
				ctx.stroke()
      //}
		})    
    
    ctx.fillStyle = 'red'
	  ctx.fillRect(sx - half, sy - half, size, size)
	})
}
