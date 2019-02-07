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
}

export const update = state => {
	
}
