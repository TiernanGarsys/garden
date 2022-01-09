import { Settings } from './Settings';

export type AgentId = string;
export type EdgeId = string;
export type NodeId = string;
export type Point = [number, number];
export type Segment = [Point, Point];

export interface SimUpdate {
  addedAgents: AgentId[],
  addedNodes: NodeId[],
  addedEdges: EdgeId[],
  removedAgents: AgentId[],  
  removedNodes: NodeId[],  
  removedEdges: EdgeId[],
}

interface Agent {
  id: AgentId,
  position: Point,
  finalDest: NodeId,
  currentDest: NodeId,
  currentEdge: EdgeId,
}

interface Node {
  id: AgentId,
  position: Point,
  edges: EdgeId[],
}

interface Edge {
  id: EdgeId,
  src: NodeId,
  dst: NodeId,
}

class Sim {
  settings: Settings;
  agents: Map<AgentId, Agent>;
  nodes: Map<NodeId, Node>;
  edges:Map<EdgeId, Edge>; 

  constructor(settings: Settings) {
    this.settings = settings;
    this.agents = new Map<AgentId, Agent>();
    this.nodes = new Map<NodeId, Node>();
    this.edges = new Map<EdgeId, Edge>();
  }

  initTest() {
    this.nodes.set("N1", {
      id: "N1",
      position: [0.25, 0.5],
      edges: ["E1", "E2"],
    });
    this.nodes.set("N2", {
      id: "N2",
      position: [0.75, 0.5],
      edges: ["E1", "E2"],
    });
    this.edges.set("E1", {
      id: "E1",
      src: "N1",
      dst: "N2",
    });
    this.edges.set("E2", {
      id: "E2",
      src: "N2",
      dst: "N1",
    });

    return {
      addedAgents: [],
      addedNodes: ["N1", "N2"],
      addedEdges: ["E1", "E2"],
      removedAgents: [],
      removedNodes: [],
      removedEdges: [],
    };
  }

  setSettings(settings: Settings) {
    this.settings = settings;
  }

  getAgentPosition(id: AgentId): Point { 
    const agent = this.agents.get(id);
    if (agent) {
      return agent.position;
    } else {
      throw new Error(`No agent with ID: ${ id }`)
    }
  }

  getNodePosition(id: NodeId): Point { 
    const node = this.nodes.get(id);
    if (node) {
      return node.position;
    } else {
      throw new Error(`No node with ID: ${ id }`)
    }
  }

  getEdgePosition(id: EdgeId): Segment { 
    const edge = this.edges.get(id);
    if (edge) {
      const p1 = this.getNodePosition(edge.src);
      const p2 = this.getNodePosition(edge.dst);
      return [p1, p2];
    } else {
      throw new Error(`No edge with ID: ${ id }`)
    }
  }

  tick(delta: number): SimUpdate {

    // TODO(tiernan): Check whether we should remove nodes ()
    // TODO(tiernan): Check whether we should remove edge (references null node)

    for (let agent in this.agents) {
      // TODO(tiernan): If agent is at final dstination, delete
      // TODO(tiernan): If agent is at current dstination, choose new one
      // TODO(tiernan): ELSE: move agent toward current dstination at speed
      //  informed by edge being used for travel
    }

    // TODO(tiernan): Check whether we should add agents (time since last AND not full)
    // TODO(tiernan): Check whether we should add nodes (time since last AND not full)

    return {
      addedAgents: [],
      addedNodes: [],
      addedEdges: [],
      removedAgents: [],
      removedNodes: [],
      removedEdges: [],
    };
  }
}

export default Sim;