import * as _ from "lodash";

import { Settings } from './Settings';

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
  neighbors: NodeId[],
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

  BASE_AGENT_SPEED = 0.001;

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
      neighbors: ["N2"],
    });
    this.nodes.set("N2", {
      id: "N2",
      position: [0.75, 0.5],
      edges: ["E2"],
      neighbors: ["N1"],
    });
    this.nodes.set("N3", {
      id: "N3",
      position: [0.6, 0.2],
      edges: ["E2"],
      neighbors: [],
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
    this.agents.set("A2", {
      id: "A2",
      position: [0.5, 0.5],
      currentDest: "N2",
      finalDest: "N1",
      currentEdge: "E1",
    });
    this.agents.set("A3", {
      id: "A2",
      position: [0.5, 0.5],
      currentDest: "N3",
      finalDest: "N2",
      currentEdge: "E1",
    });

    return {
      addedAgents: ["A1", "A2", "A3"],
      addedNodes: ["N1", "N2", "N3"],
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

  /*
  getNextStep(current: NodeId, destination: NodeId): NodeId {
    if (current == destination) {
      return destination;
    }

    const unvisited = Array.from(this.nodes.keys());
    const distanceById = new Map<NodeId, number>();
    const parentById = new Map<NodeId, NodeId>();
    distanceById.set(current, 0);

    // TODO(tiernan): Short-circuit based on heuristic.

    while (unvisited.length > 0) {
      let currNodeId = null;
      let currDistance = Number.MAX_VALUE;
      for (const nodeId of unvisited) {
        if (distanceById.has(nodeId) && distanceById.get(nodeId)! < currDistance) {
          currNodeId = nodeId;
          currDistance = distanceById.get(nodeId)!;
        }
      }

      if (currNodeId == destination) {
        break;
      }

      const currNode = this.nodes.get(currNodeId!);
      const neighbors = currNode?.neighbors.filter((v) => {
        return unvisited.lastIndexOf(v) >= 0;
      })!;

      if (neighbors) {
        for (const neighborId of neighbors) {
          const neighbor = this.getNode(neighborId);
          const distanceToNeighbor = distanceById.get(currNodeId!)! + this.getDistance(currNode?.position!, neighbor.position!);
          if (distanceById.get(neighborId)! > distanceToNeighbor) {
            distanceById.set(neighborId, distanceToNeighbor);
            parentById.set(neighborId, currNodeId!);
          }
        }
      }

      unvisited.splice(unvisited.lastIndexOf(currNodeId!), 1);
    }

    let nextDestination = destination;
    while (parentById.get(nextDestination) != current) {
      nextDestination = parentById.get(nextDestination)!;
    }

    return nextDestination;
    // TODO: account for edge speed weightingA
    // TODO: cache distance graph
  }
  */

  getNextPosition(agent: Agent): Point {
    const curr = agent.position;
    const dest = this.getNode(agent.currentDest).position;
    const dist = this.getDistance(curr, dest);

    // TODO(tiernan): Consider edge scaling
    const scale = this.BASE_AGENT_SPEED / dist;

    const dx = dest[0] - curr[0];
    const dy = dest[1] - curr[1];

    if (scale >= 1) {
      return [curr[0] + dx, curr[1] + dy]
    } else {
      return [curr[0] + dx * scale, curr[1] + dy * scale];
    }
  }

  tick(delta: number): SimUpdate {
    console.log(`delta: ${delta}`);

    // TODO(tiernan): Check whether we should remove nodes ()
    // TODO(tiernan): Check whether we should remove edge (references null node)

    this.agents.forEach((agent, id) => {
      if (this.atDestination(agent)) {
        console.log("JOB'S DONE!");
        if (agent.currentDest == agent.finalDest) {
          agent.finalDest = _.sample(Array.from(this.nodes.keys()))!;
        }
        agent.currentDest = agent.finalDest;
        // agent.currentDest = this.getNextStep(agent.currentDest, agent.finalDest);
      }

      agent.position = this.getNextPosition(agent);
    });

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