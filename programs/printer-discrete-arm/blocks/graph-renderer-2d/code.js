export const run = ({ state, output }) => {
	state.canvas = document.createElement('canvas')
  state.canvas.style.border = '1px solid black'
  state.canvas.style.margin = '10px'
  state.ctx = state.canvas.getContext("2d")
  state.canvas.width = 300
  state.canvas.height = 300
  output.appendChild(state.canvas)
}

export const update = ({ state }) => {
  const { canvas, ctx, graph } = state
  const size = 4
  const half = Math.floor(size / 2)
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  graph.forEachNode(function(node){
    const feature = node.data.feature.data
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
      	const tFeature = linkedNode.data.feature.data
				const tx = tFeature[0] * canvas.width
      	const ty = tFeature[1] * canvas.height
	      
	      ctx.beginPath()
				ctx.moveTo(sx, sy)
				ctx.lineTo(tx, ty)
				ctx.stroke()
      //}
		})    
    
    if(state.globalTarget === node.id){
      ctx.fillStyle = 'blue'
    }else if(state.lastWinner === node.id){
      ctx.fillStyle = 'red'
    }else{
    	ctx.fillStyle = 'green'  
    }    
	  ctx.fillRect(sx - half, sy - half, size, size)
                
    ctx.fillStyle = 'blue'
    const { position, randomTargets, randomChoice } = state
    const px = position[0]
    const py = position[1]
    const pxc = px * canvas.width
    const pyc = py * canvas.height
    ctx.fillRect(pxc - half,pyc - half, size, size)
    
    if(state.mode === 'explore'){
      
      for(var v=0; v<randomTargets.length; v++){
        const t = randomTargets[v].data
        const vx = t[0] * 10
        const vy = t[1] * 10

        ctx.strokeStyle = 'grey'    
        ctx.beginPath()
        ctx.moveTo(pxc, pyc)
        ctx.lineTo((px + vx) * canvas.width, (py + vy) * canvas.height)
        ctx.stroke()    
      }

      const t = randomChoice.data
      if(t){
      	const vx = t[0] * 10
      	const vy = t[1] * 10

      	ctx.strokeStyle = 'pink'    
      	ctx.beginPath()
      	ctx.moveTo(pxc, pyc)
      	ctx.lineTo((px + vx) * canvas.width, (py + vy) * canvas.height)
      	ctx.stroke()                    
      }
    }
	})
}
