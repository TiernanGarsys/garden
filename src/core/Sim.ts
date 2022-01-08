import { Settings } from './Settings';

export type AgentId = string;
export type EdgeId = string;
export type NodeId = string;
export type Point = [number, number];

interface Agent {
  id: AgentId,
  position: Point,
  finalDest: number,
  currentDest: number,
  currentEdge: number,
}

interface Node {
  id: AgentId,
  position: Point,
  edges: EdgeId[],
}

interface Edge {
  id: EdgeId,
  src: NodeId,
  dest: NodeId,
}

interface SimUpdate {
  addedAgents: AgentId[],
  addedNodes: NodeId[],
  addedEdges: EdgeId[],
  removedAgents: AgentId[],  
  removedNodes: NodeId[],  
  removedEdges: EdgeId[],
}

class Sim {
  settings: Settings;
  agents: Agent[]; 
  nodes: Node[];
  edges: Edge[];

  constructor(settings: Settings) {
    this.settings = settings;
    this.agents = [];
    this.nodes = [];
    this.edges = [];

    this.initTest();
  }

  initTest() {
    this.nodes.push({
      id: "N1",
      position: [0.25, 0.5],
      edges: ["E1", "E2"],
    });
    this.nodes.push({
      id: "N2",
      position: [0.75, 0.5],
      edges: ["E1", "E2"],
    });
    this.edges.push({
      id: "E1",
      src: "N1",
      dest: "N2",
    });
    this.edges.push({
      id: "E2",
      src: "N2",
      dest: "N1",
    });
  }

  setSettings(settings: Settings) {
    this.settings = settings;
  }

  tick(delta: number): SimUpdate {

    // TODO(tiernan): Check whether we should remove nodes ()
    // TODO(tiernan): Check whether we should remove edge (references null node)

    for (let agent in this.agents) {
      // TODO(tiernan): If agent is at final destination, delete
      // TODO(tiernan): If agent is at current destination, choose new one
      // TODO(tiernan): ELSE: move agent toward current destination at speed
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