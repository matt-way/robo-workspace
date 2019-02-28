import createGraph from 'ngraph.graph'
import { random } from 'lodash'

const createFeature = pos => {
  const f = new Float64Array(pos.length)
  f.set(pos)
  return f
}

export const run = ({ state }) => {
	state.graph = createGraph()    
  state.graph.addNode(0, {
    feature: createFeature(state.input),
    timesActive: 1
    /*changeVector: new Float64Array(2),
    transformVectors: [
      new Float64Array(2),
      new Float64Array(2)
    ],
    output: new Float64Array(2)*/
  })
  state.lastWinner = -1
  state.lastInput = new Float64Array(state.input.length)
  
  state.changeVector = new Float64Array(2)
  state.transformVectors = [
    new Float64Array([10, 1]),
    new Float64Array([1, 10])
  ]
  state.output = new Float64Array(2)
  
  state.totalError = 0
  state.lastError = Number.MAX_VALUE
}

export const update = ({ state, iteration }) => {
  const { 
    graph, input, motion,
    changeVector, transformVectors, output
  } = state
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
  	changeVector[d] = input[d] - state.lastInput[d]
  }
  output.fill(0)
  for(var i=0; i<transformVectors.length; i++){
    const f = transformVectors[i]
    output[i] += changeVector[0] * f[0]
    output[i] += changeVector[1] * f[1]    
  }
  state.lastError = 0
  for(var i=0; i<transformVectors.length; i++){
    const f = transformVectors[i]
    const err = motion[i] - output[i]
    state.totalError += (err * err)
    state.lastError += err * err
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
  if(state.lastWinner !== closestId){
    if(state.lastWinner >= 0){
      const link = graph.getLink(state.lastWinner, closestId)
      if(link){
        link.data.incidence++
      }else{
        graph.addLink(state.lastWinner, closestId, {
          incidence: 1
        })        
      }
      graph.getNode(state.lastWinner).data.timesActive++
    }
    state.lastWinner = closestId
  }
  
  state.lastInput.set(input)
  
  /*if(iteration %200 === 0){
    console.log('avg error', io.totalError / 200)
    io.totalError = 0
  }*/
}
