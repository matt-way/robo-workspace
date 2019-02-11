import { random } from 'lodash'
import path from 'ngraph.path'
import '../../common/typed-array-funcs'

export const run = (state, { io }) => {
  io.motion = [0, 0]  
  io.globalTarget = 0
  io.goalTime = 0
  io.pathFinder = path.aStar(io.graph, {
    oriented: false
  })
  io.moveVector = new Float64Array(2)
}

export const update = (state, { io, iteration }) => {
  const { input, graph, pathfinder, motion, moveVector } = io
  
  const maxGoalTime = 200
  const winner = graph.getNode(state.lastWinner)
  
  if(state.lastWinner === io.globalTarget){
  	if(io.goalTime > maxGoalTime){
    	// choose a new global goal
      
      // find worst edge count nodes, and randomly choose one
      var worst = []
      var worstCount = Number.MAX_VALUE
			graph.forEachNode(node => {
        const linkCount = graph.getLinks(node.id).length
        if(linkCount < worstCount){
          worst = [node.id]
          worstCount = linkCount
        }else if(linkCount === worstCount){
          worst.push(node.id)
        }
      })
      io.globalTarget = worst[random(0, worst.length - 1)]			      
      io.goalTime = 0
    }else{
      io.goalTime++      
    }
  }else if(winner.data.timeActive === 1){
   	// onto a new graph node
    io.globalTarget = state.lastWinner
    io.goalTime = 0   
  }
  
  if(state.lastWinner === io.globalTarget){
    // do a random move
    motion[0] = random(-1, 1, true)
  	motion[1] = random(-1, 1, true)
  }else{
    // do regular target movement
    const speed = 0.01  
   
   	// work out the best path
    const targetPath = io.pathFinder.find(state.lastWinner, io.globalTarget)
    if(targetPath.length > 1){      
     	io.localGoalIndex = targetPath[targetPath.length - 2]
      const node = graph.getNode(io.localGoalIndex.id)
      const tLoc = node.data.feature
      
      // work out the desired vector from where we are to the local target
      moveVector.fill(0)
			for(var d=0; d<input.length; d++){
  			moveVector[d] = tLoc[d] - input[d]
  		}
      // scale the vector to the required speed length
      moveVector.normalise(speed)
      // set the next output
  		motion.fill(0)
  		for(var i=0; i<state.transformVectors.length; i++){
    		const f = state.transformVectors[i]
    		motion[i] += moveVector[0] * f[0]
    		motion[i] += moveVector[1] * f[1]    
  		}     
    }
  }
  
  /*  
  if(iteration < 1000000){
    motion[0] = random(-1, 1, true)
  	motion[1] = random(-1, 1, true)
  }else{    
    const speed = 0.01
    
   	if(state.lastWinner === io.globalTarget){
      io.globalTarget = random(0, graph.getNodesCount() - 1)
    }
    
   	// work out the best path
    const targetPath = io.pathFinder.find(state.lastWinner, io.globalTarget)
    if(targetPath.length > 1){      
     	io.localGoalIndex = targetPath[targetPath.length - 2]
      const node = graph.getNode(io.localGoalIndex.id)
      const tLoc = node.data.feature
      
      // work out the desired vector from where we are to the local target
      moveVector.fill(0)
			for(var d=0; d<input.length; d++){
  			moveVector[d] = tLoc[d] - input[d]
  		}
      // scale the vector to the required speed length
      moveVector.normalise(speed)
      // set the next output
  		motion.fill(0)
  		for(var i=0; i<state.transformVectors.length; i++){
    		const f = state.transformVectors[i]
    		motion[i] += moveVector[0] * f[0]
    		motion[i] += moveVector[1] * f[1]    
  		}     
    }    
  } 
  */
  
}
