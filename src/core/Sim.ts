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
  MAX_NODES = 50;
  MAX_AGENTS = 100;

  BASE_AGENT_SPEED = 0.001;

  NODE_SPAWN_RATE = 500;
  AGENT_SPAWN_RATE = 500;

  OVERLAP_THRESHOLD = 0.001;

  settings: Settings;
  agents: Map<AgentId, Agent>;
  nodes: Map<NodeId, Node>;
  edges:Map<EdgeId, Edge>; 

  nextId: number;
  elapsed: number;

  constructor(settings: Settings) {
    this.settings = settings;
    this.agents = new Map<AgentId, Agent>();
    this.nodes = new Map<NodeId, Node>();
    this.edges = new Map<EdgeId, Edge>();

    this.elapsed = 0;
    this.nextId = 0;
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

  getNextId() {
    const newId = this.nextId
    this.nextId += 1;
    return newId.toString();
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

  spawn(): SimUpdate {
    const addedNodes = [];
    const addedAgents = [];

    if (this.elapsed == 0 || (this.nodes.size < this.MAX_NODES && this.elapsed % this.NODE_SPAWN_RATE == 0)) {
      const id = this.getNextId();
      this.nodes.set(id, {
        id: id,
        edges: [],
        neighbors: [],
        position: [Math.random(), Math.random()]
      });
      addedNodes.push(id);
    }
    if (this.elapsed == 0 || (this.agents.size < this.MAX_AGENTS && this.elapsed % this.AGENT_SPAWN_RATE == 0)) {
      const id = this.getNextId();
      addedAgents.push(id);
      this.agents.set(id, {
        id: id,
        position: [Math.random(), Math.random()],
        currentDest: _.sample(Array.from(this.nodes.keys()))!,
        finalDest: _.sample(Array.from(this.nodes.keys()))!,
      });
    }
    return {
      addedAgents: addedAgents,
      addedNodes: addedNodes,
      addedEdges: [],
      removedAgents: [],
      removedNodes: [],
      removedEdges: [],
    };
  }

  tick(delta: number): SimUpdate {
    const update = this.spawn();

    // TODO: scale by delta instead of assuming same time per tick
    // TODO(tiernan): Check whether we should remove nodes ()
    // TODO(tiernan): Check whether we should remove edge (references null node)

    this.agents.forEach((agent, id) => {
      if (this.atDestination(agent)) {
        console.log(`Agent "${id}" reached node "${agent.finalDest}"`);
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

    this.elapsed += 1;
    return update;
  }
}

export default Sim;