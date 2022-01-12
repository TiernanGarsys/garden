import * as _ from "lodash";
import { UPDATE_PRIORITY } from "pixi.js";
import { getEnabledCategories } from "trace_events";

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
  currentEdge: EdgeId | null,
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
  uses: number,
}

class Sim {
  // TODO(tiernan): Configure these via settings.
  MAX_NODES = 50;
  MAX_AGENTS = 25;

  BASE_AGENT_SPEED = 0.001;
  USE_SPEED_SCALE = 0.0005;

  NODE_SPAWN_RATE = 25;
  AGENT_SPAWN_RATE = 50;

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
    const dy = Math.abs(p2[1] - p1[1]);
    return Math.sqrt(dx * dx + dy * dy);
  }

  getScaledDistance(id: EdgeId) {
    // TODO: could be null (if deleted while traversing)
    const edge = this.getEdge(id);
    const src = this.getNode(edge.src);
    const dst = this.getNode(edge.dst);

    const distance = this.getDistance(src.position, dst.position);
    return distance / (this.BASE_AGENT_SPEED + this.USE_SPEED_SCALE * edge.uses);
  }

  atDestination(agent: Agent) {
    const destination = this.getNode(agent.currentDest);
    return this.getDistance(agent.position, destination.position) < this.OVERLAP_THRESHOLD;
  }

  getNextPosition(agent: Agent): Point {
    const curr = agent.position;
    const dest = this.getNode(agent.currentDest).position;
    const dist = this.getDistance(curr, dest);

    // TODO(tiernan): Consider edge scaling
    const scale = this.BASE_AGENT_SPEED / dist;

    const dx = dest[0] - curr[0];
    const dy = dest[1] - curr[1];

    if (scale >= 1) {
      // If we would go past the destination at the current speed
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
        position: [Math.random(), Math.random()]
      });
      addedNodes.push(id);
    }
    if (this.elapsed == 0 || (this.agents.size < this.MAX_AGENTS && this.elapsed % this.AGENT_SPAWN_RATE == 0)) {
      const id = this.getNextId();
      addedAgents.push(id);
      this.agents.set(id, {
        id: id,
        position: _.sample(Array.from(this.nodes.values()))!.position,
        currentDest: _.sample(Array.from(this.nodes.keys()))!,
        finalDest: _.sample(Array.from(this.nodes.keys()))!,
        currentEdge: null,
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

  getNextStep(fromId: NodeId, toId: NodeId): [NodeId, EdgeId | null] {
    const from = this.getNode(fromId);
    const to = this.getNode(toId);

    let dest = toId;
    let edge = null;
    let dist = this.getDistance(from.position, to.position);

    for (const candidateId of from.edges) {
      const candidate = this.getEdge(candidateId);
      const scaled = this.getScaledDistance(candidateId);

      if (scaled < dist) {
        dest = candidate.dst;
        dist = scaled;
        edge = candidateId;
      }
    }

    return [dest, edge];
  }

  tick(delta: number): SimUpdate {
    let update = this.spawn();

    // TODO: scale by delta instead of assuming same time per tick
    // TODO(tiernan): Check whether we should remove nodes ()
    // TODO(tiernan): Check whether we should remove edge (references null node)

    this.agents.forEach((agent, id) => {
      if (this.atDestination(agent)) {
        console.log(`Agent "${id}" reached node "${agent.finalDest}"`);
        if (agent.currentDest == agent.finalDest) {
          agent.finalDest = _.sample(Array.from(this.nodes.keys()))!;
        }
        const src = agent.currentDest;
        const nextStep = this.getNextStep(src, agent.finalDest);

        if (nextStep[1] == null) {
          const newEdgeId = this.getNextId();
          this.edges.set(newEdgeId, {
              id: newEdgeId,
              src: src,
              dst: nextStep[0],
              uses: 1,
          });
          update = {...update, ...{addedEdges: [newEdgeId]}}
        }
        // TODO(tiernan): Form edge between src and currentDest if one doesn't exist, else increase uses by one
        agent.currentEdge = nextStep[1];
        agent.currentDest = nextStep[0];
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