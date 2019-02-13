import createGraph from 'ngraph.graph'
import { random } from 'lodash'

const createFeature = pos => {
  const f = new Float64Array(pos.length)
  f.set(pos)
  return f
}

export const run = (state, { io }) => {  
	io.graph = createGraph()    
  io.graph.addNode(0, {
    feature: createFeature(io.input),
    timesActive: 0
    /*changeVector: new Float64Array(2),
    transformVectors: [
      new Float64Array(2),
      new Float64Array(2)
    ],
    output: new Float64Array(2)*/
  })
  io.lastWinner = -1
  io.lastInput = new Float64Array(io.input.length)
  
  io.changeVector = new Float64Array(2)
  io.transformVectors = [
    new Float64Array([10, 1]),
    new Float64Array([1, 10])
  ]
  io.output = new Float64Array(2)
  
  io.totalError = 0
  io.lastError = Number.MAX_VALUE
}

export const update = (state, { io, iteration }) => {
  const { 
    graph, input, motion,
    changeVector, transformVectors, output
  } = io
	const learningRate = 0.001
  const outputLearningRate = 0.05
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
  
  // do motion learning
  // calculate the change vector
  /*const { changeVector, transformVectors, output } = winner.data 
  for(var d=0; d<input.length; d++){
  	changeVector[d] = input[d] - io.lastInput[d]
  }
  // calculate the current output transform      
  output.fill(0)
  for(var i=0; i<transformVectors.length; i++){
    const f = transformVectors[i]
    output[i] += changeVector[0] * f[0]
    output[i] += changeVector[1] * f[1]    
  }
  // do feature learning
  for(var i=0; i<transformVectors.length; i++){
  	const f = transformVectors[i]
    const err = motion[i] - output[i]
    io.totalError += (err * err)
    for(var j=0; j<f.length; j++){
    	f[j] += Math.sign(changeVector[j]) * err * outputLearningRate
    }
  }
  */
  
  // only learn motion in exploratory mode
  for(var d=0; d<input.length; d++){
  	changeVector[d] = input[d] - io.lastInput[d]
  }
  output.fill(0)
  for(var i=0; i<transformVectors.length; i++){
    const f = transformVectors[i]
    output[i] += changeVector[0] * f[0]
    output[i] += changeVector[1] * f[1]    
  }
  io.lastError = 0
  for(var i=0; i<transformVectors.length; i++){
    const f = transformVectors[i]
    const err = motion[i] - output[i]
    io.totalError += (err * err)
    io.lastError += err * err
    for(var j=0; j<f.length; j++){
      f[j] += Math.sign(changeVector[j]) * err * outputLearningRate
    }
  }  
   
  // check if we need to create any new nodes in the graph
	if(minDistance > splitDistance){
    const newId = graph.getNodesCount()
  	graph.addNode(newId, {
      feature: createFeature(input),
      timesActive: 0
			/*changeVector: new Float64Array(2),
    	transformVectors: [
      	new Float64Array(2),
      	new Float64Array(2)
    	],
    	output: new Float64Array(2)*/
    })
    closestId = newId
  }
    
  // learn the feature
  const trueWinner = graph.getNode(closestId)
  const { feature } = trueWinner.data
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
      graph.getNode(io.lastWinner).data.timesActive++
    }
    io.lastWinner = closestId
  }
  
  io.lastInput.set(input)
  
  /*if(iteration %200 === 0){
    console.log('avg error', io.totalError / 200)
    io.totalError = 0
  }*/
}
