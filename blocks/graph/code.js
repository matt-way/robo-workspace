import createGraph from 'ngraph.graph'

const createFeature = pos => {
  const f = new Float64Array(pos.length)
  f.set(pos)
  return f
}

export const run = (state, { io }) => {  
	io.graph = createGraph()    
  io.graph.addNode(0, {
    feature: createFeature(io.input)
  })
  io.lastWinner = -1
}

export const update = (state, { io }) => {
  const { graph, input } = io
	const learningRate = 0.001
  const splitDistance = 0.1
  
  // find the closest node
  var closestId = 0
  var minDistance = Number.MAX_VALUE
  graph.forEachNode(({ id, data }) => {
    const feature = data.feature
    var dist = 0    
    for(var d=0; d<feature.length; d++){
      dist += (feature[d] - input[d]) ** 2
    }
		dist = Math.sqrt(dist)
    if(dist < minDistance){
      closestId = id
      minDistance = dist
    }
  })
  
  const winner = graph.getNode(closestId)
  
  // check if we need to create any new nodes in the graph
	if(minDistance > splitDistance){
    const newId = graph.getNodesCount()
  	graph.addNode(newId, {
      feature: createFeature(input)
    })
    closestId = newId
  }
    
  // learn the feature
  const { feature } = graph.getNode(closestId).data
  for(var d=0; d<feature.length; d++){
  	feature[d] += (input[d] - feature[d]) * learningRate
  }
  
  // do edge incrementing
  if(io.lastWinner !== closestId){
    if(io.lastWinner >= 0){
      const link = graph.getLink(io.lastWinner, closestId)
      if(link){
        link.data.incidence++
      }else{
        graph.addLink(io.lastWinner, closestId, {
          incidence: 1
        })
      }
    }                                 
                                 
    io.lastWinner = closestId
  }
}
