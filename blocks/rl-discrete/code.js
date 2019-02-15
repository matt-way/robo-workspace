import { random } from 'lodash'
import path from 'ngraph.path'
import '../../common/typed-array-funcs'

export const run = (state, { io }) => {
  io.motion = [0.5, 0.5]  
  io.globalTarget = 0
  io.goalTime = 0
  io.pathFinder = path.aStar(io.graph, {
    oriented: false
  })
  io.moveVector = new Float64Array(2)
  io.randomMove = true
  
  io.randomTargets = [
    new Float64Array(2),
    new Float64Array(2),
    new Float64Array(2),
    //new Float64Array(2),
    /*new Float64Array(2),
    new Float64Array(2),
    new Float64Array(2),
    new Float64Array(2),
    new Float64Array(2),
    new Float64Array(2)*/
  ]
  
  io.stagnantCount = 0
  io.currentIndex = -1
  io.mode = 'explore'
}

export const update = (state, { io, iteration }) => {
  const { input, graph, pathfinder, motion, moveVector } = io
  
  const speed = 0.01 
  const minExploreTime = 1000
  
  if(io.mode === 'global'){
    
  }else if(io.mode === 'explore'){
  	
    if(state.lastWinner !== io.currentIndex){  
      const tempPos = new Float64Array(2)
      var bestVector = io.randomTargets[0]
      var bestDistance = 0

      // generate set of random target vectors
      io.randomTargets.forEach(t => {
        t[0] = random(-1, 1, true) 
        t[1] = random(-1, 1, true) 
        t.normalise(speed)

        var minDistance = Number.MAX_VALUE
        var idHash = {}
        graph.forEachLinkedNode(state.lastWinner, function(linkedNode, link){
					if(!idHash[linkedNode.id]){
          	tempPos.set(input)
          	tempPos.add(t)
          	const dist = tempPos.distance(linkedNode.data.feature)
          	if(dist < minDistance){
	            minDistance = dist
	          }
            idHash[linkedNode.id] = true
          }
        })

        if(minDistance > bestDistance){
          bestDistance = minDistance
          bestVector = t
        }
      })

      io.randomChoice = bestVector
      moveVector.set(bestVector)

      // generate output based on the target vector
      motion.fill(0)
      for(var i=0; i<state.transformVectors.length; i++){
        const f = state.transformVectors[i]
        motion[i] += moveVector[0] * f[0]
        motion[i] += moveVector[1] * f[1]    
      } 
      
      io.currentIndex = state.lastWinner
      io.stagnantCount = 0
    }
  }
  
  var smallest = Number.MAX_VALUE
  var bestNode = 0
	graph.forEachNode(node => {
    if(node.data.timesActive < smallest && node.id !== state.lastWinner){
     	bestNode = node.id
     	smallest = node.data.timesActive
    }
  })
  io.globalTarget = bestNode
  
  
  
  /*
  //if(iteration % 5000 === 0){ debugger }
      
  if(iteration < 2000){
    motion[0] = random(-1, 1, true)
  	motion[1] = random(-1, 1, true)
  }else if(io.mode === 'global'){
    
    if(state.lastWinner === io.globalTarget ||
      io.goalTime > 100){
    	io.mode = 'explore'
      io.stagnantCount = 0      
    }else{
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
        io.randomMove = false
        // set the next output
        motion.fill(0)
        for(var i=0; i<state.transformVectors.length; i++){
          const f = state.transformVectors[i]
          motion[i] += moveVector[0] * f[0]
          motion[i] += moveVector[1] * f[1]    
        }     
      }
      io.goalTime++
    }    
    
  }else if(io.mode === 'explore'){
    if(state.lastWinner !== io.currentIndex){  
      const tempPos = new Float64Array(2)
      var bestVector = io.randomTargets[0]
      var bestDistance = 0

      // generate set of random target vectors
      io.randomTargets.forEach(t => {
        t[0] = random(-1, 1, true) 
        t[1] = random(-1, 1, true) 
        t.normalise(speed)

        var minDistance = Number.MAX_VALUE
        graph.forEachLinkedNode(state.lastWinner, function(linkedNode, link){
          tempPos.set(input)
          tempPos.add(t)
          const dist = tempPos.distance(linkedNode.data.feature)
          if(dist < minDistance){
            minDistance = dist
          }
        }, true)

        if(minDistance > bestDistance){
          bestDistance = minDistance
          bestVector = t
        }
      })

      io.randomChoice = bestVector
      moveVector.set(bestVector)

      // generate output based on the target vector
      motion.fill(0)
      for(var i=0; i<state.transformVectors.length; i++){
        const f = state.transformVectors[i]
        motion[i] += moveVector[0] * f[0]
        motion[i] += moveVector[1] * f[1]    
      } 
      
      io.currentIndex = state.lastWinner
      io.stagnantCount = 0
    }else{
     	io.stagnantCount++
      
      if(io.stagnantCount > 50){
      	// choose a new global node and change mode
        var smallest = Number.MAX_VALUE
      	var bestNode = 0
				graph.forEachNode(node => {
        	if(node.data.timeSinceDiscovery < smallest){
          	bestNode = node.id
          	smallest = node.data.timeSinceDiscovery
        	}
      	})
      	io.globalTarget = bestNode
      	io.goalTime = 0
        io.mode = 'global'
      }
    }
  }
  */
  
  // force random until movement error is ok
  //if(state.currentError > 0.2){    
  /*if(iteration < 20000){
    motion[0] = random(-1, 1, true)
  	motion[1] = random(-1, 1, true)
  }else{  
    io.goalTime++    
    
    if(io.goalTime > minExploreTime){
    	// update the global target to be the
      // node with the smallest time since last discovery (reward)
			var smallest = Number.MAX_VALUE
      var bestNode = 0
			graph.forEachNode(node => {
        if(node.data.timeSinceDiscovery < smallest){
          bestNode = node.id
          smallest = node.data.timeSinceDiscovery
        }
      })
      io.globalTarget = bestNode
      io.goalTime = 0
    }
    
    if(state.lastWinner === io.globalTarget){
      // do a random move
      motion[0] = random(-1, 1, true)
      motion[1] = random(-1, 1, true)
      io.randomMove = true
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
        io.randomMove = false
        // set the next output
        motion.fill(0)
        for(var i=0; i<state.transformVectors.length; i++){
          const f = state.transformVectors[i]
          motion[i] += moveVector[0] * f[0]
          motion[i] += moveVector[1] * f[1]    
        }     
      }
    }
  }*/
  
  /*
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
  */
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
