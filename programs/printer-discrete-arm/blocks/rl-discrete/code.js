import { random } from 'lodash'
import path from 'ngraph.path'
import ndarray from 'ndarray'
import ops from 'ndarray-ops'
import distance from 'ndarray-distance'

export const run = ({ state }) => {
  state.motion = [0.5, 0.5]
  state.globalTarget = 0
  state.goalTime = 0
  state.pathFinder = path.aStar(state.graph, {
    oriented: false
  })
  state.moveVector = ndarray(new Float64Array(2))
  state.randomMove = true

  state.randomTargets = []
  for (var i = 0; i < 5; i++) {
    state.randomTargets.push(ndarray(new Float64Array(2)))
  }

  state.stagnantCount = 0
  state.lastGraphSize = state.graph.getNodesCount()
  state.currentIndex = -1
  state.mode = 'explore'
}

const normalise = (arr, len = 1) => {
  const mag = ops.norm2(arr) / len
  ops.divseq(arr, mag)
}

export const update = ({ state, iteration }) => {
  const { input, graph, pathfinder, motion, moveVector } = state

  const speed = 0.01
  const maxExploreStagnation = 100
  const maxGlobalStagnation = 500
  const enforce = false
  //io.globalTarget = 60

  if (state.mode === 'global' || enforce) {
    // work out the best path
    const targetPath = state.pathFinder.find(
      state.lastWinner,
      state.globalTarget
    )
    if (targetPath.length > 0) {
      state.localGoalIndex =
        targetPath.length > 1
          ? targetPath[targetPath.length - 2]
          : targetPath[0]
      const node = graph.getNode(state.localGoalIndex.id)
      const tLoc = node.data.feature.data

      // work out the desired vector from where we are to the local target
      const mv = moveVector.data
      mv.fill(0)
      for (var d = 0; d < input.length; d++) {
        mv[d] = tLoc[d] - input[d]
      }
      // scale the vector to the required speed length
      normalise(moveVector, speed)
      state.randomMove = false
      // set the next output
      const mo = motion
      mo.fill(0)
      for (var i = 0; i < state.transformVectors.length; i++) {
        const f = state.transformVectors[i]
        mo[i] += mv[0] * f[0]
        mo[i] += mv[1] * f[1]
      }
    }

    state.stagnantCount++

    if (
      state.lastWinner === state.globalTarget ||
      state.stagnantCount > maxGlobalStagnation
    ) {
      state.mode = 'explore'
      state.stagnantCount = 0
    }
  } else if (state.mode === 'explore') {
    if (state.lastGraphSize !== graph.getLinksCount()) {
      state.stagnantCount = 0
      state.lastGraphSize = graph.getLinksCount()
    }

    if (state.lastWinner !== state.currentIndex) {
      const tempPos = ndarray(new Float64Array(2))
      var bestVector = state.randomTargets[0]
      var bestDistance = 0

      // generate set of random target vectors
      const curNode = graph.getNode(state.lastWinner)
      state.randomTargets.forEach(t => {
        t.data[0] = random(-1, 1, true)
        t.data[1] = random(-1, 1, true)
        normalise(t, speed)

        var minDistance = Number.MAX_VALUE
        var idHash = {}
        graph.forEachLinkedNode(state.lastWinner, function(linkedNode, link) {
          if (!idHash[linkedNode.id]) {
            //
            ops.assign(tempPos, linkedNode.data.feature)
            ops.subeq(tempPos, curNode.data.feature)
            normalise(tempPos, speed)

            //tempPos.set(input)
            //tempPos.set(curNode.data.feature)
            //tempPos.add(t)
            //const dist = tempPos.distance(linkedNode.data.feature)
            const dist = distance(t, tempPos)
            if (dist < minDistance) {
              minDistance = dist
            }
            idHash[linkedNode.id] = true
          }
        })

        if (minDistance > bestDistance) {
          bestDistance = minDistance
          bestVector = t
        }
      })

      state.randomChoice = bestVector
      ops.assign(moveVector, bestVector)

      // generate output based on the target vector
      motion.fill(0)
      for (var i = 0; i < state.transformVectors.length; i++) {
        const f = state.transformVectors[i]
        motion[i] += moveVector.data[0] * f[0]
        motion[i] += moveVector.data[1] * f[1]
      }

      state.currentIndex = state.lastWinner
    }

    state.stagnantCount++

    if (state.stagnantCount > maxExploreStagnation) {
      // choose a new global node to move to before exploring again
      var smallest = Number.MAX_VALUE
      var bestNodes = []
      graph.forEachNode(node => {
        if (node.id !== state.lastWinner) {
          if (node.data.timesActive < smallest) {
            smallest = node.data.timesActive
            bestNodes = [node.id]
          } else if (node.data.timesActive === smallest) {
            bestNodes.push(node.id)
          }
        }
      })
      const choice = bestNodes[random(0, bestNodes.length - 1)]
      if (choice >= 0) {
        state.globalTarget = choice
        state.mode = 'global'
      } else {
        state.currentIndex = -1
      }
      state.stagnantCount = 0
    }
  }

  /*
  
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
  var bestNodes = []
	graph.forEachNode(node => {
    if(node.id !== state.lastWinner){
    	if(node.data.timesActive < smallest){
        smallest = node.data.timesActive
        bestNodes = [node.id]
      }else if(node.data.timesActive === smallest){
        bestNodes.push(node.id)
      }
    }    
  })
  const choice = bestNodes[random(0, bestNodes.length - 1)]
  io.globalTarget = choice
  
  
  
  
  */
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
