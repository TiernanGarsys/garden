import { Settings } from './Settings';
import Overlay from '../components/Overlay';

export type AgentId = string;
export type EdgeId = string;
export type NodeId = string;
export type Point = [number, number];
export type Segment = [Node, Node];

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
  // TODO(tiernan): Configure these via settings.
  MAX_NODES = 100;
  MAX_AGENTS = 100;

  BASE_AGENT_SPEED = 1;

  OVERLAP_THRESHOLD = 0.001;

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
      edges: ["E1"],
    });
    this.nodes.set("N2", {
      id: "N2",
      position: [0.75, 0.5],
      edges: ["E2"],
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
    this.agents.set("A1", {
      id: "A1",
      position: [0.5, 0.5],
      currentDest: "N1",
      finalDest: "N1",
      currentEdge: "E1",
    });

    return {
      addedAgents: ["A1"],
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

  getAgent(id: AgentId): Agent { 
    const agent = this.agents.get(id);
    if (agent) {
      return agent;
    } else {
      throw new Error(`No agent with ID: ${ id }`)
    }
  }

  getNode(id: NodeId): Node { 
    const node = this.nodes.get(id);
    if (node) {
      return node;
    } else {
      throw new Error(`No node with ID: ${ id }`)
    }
  }

  getEdge(id: EdgeId): Edge { 
    const edge = this.edges.get(id);
    if (edge) {
      return edge;
    } else {
      throw new Error(`No edge with ID: ${ id }`)
    }
  }

  getDistance(p1: Point, p2: Point) {
    const dx = Math.abs(p2[0] - p1[0]);
    const dy = Math.abs(p2[0] - p1[0]);
    return Math.sqrt(dx * dx + dy * dy);
  }

  atDestination(agent: Agent) {
    const destination = this.getNode(agent.currentDest);
    return this.getDistance(agent.position, destination.position) < this.OVERLAP_THRESHOLD;
  }

  tick(delta: number): SimUpdate {

    // TODO(tiernan): Check whether we should remove nodes ()
    // TODO(tiernan): Check whether we should remove edge (references null node)

    this.agents.forEach((agent, id) => {
      if (this.atDestination(agent)) {
        if (agent.currentDest == agent.finalDest) {
          // TODO(tiernan): ???
        } else {
          // TODO(tiernan): Find next current dest (path through)
        }
      }
    })

      // TODO(tiernan): If agent is at final dstination, delete
      // TODO(tiernan): If agent is at current dstination, choose new one
      // TODO(tiernan): ELSE: move agent toward current dstination at speed
      //  informed by edge being used for travel

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