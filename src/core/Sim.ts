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
  lastUse: number,
}

class Sim {
  // TODO(tiernan): Configure these via settings.
  MAX_NODES = 100;
  MAX_AGENTS = 50;

  BASE_AGENT_SPEED = 0.002;
  USE_SPEED_SCALE = 0.002;

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

  getScaledDistance(srcId: NodeId, dstId: NodeId): number {
    // TODO: could be null (if deleted while traversing)
    const srcNode = this.getNode(srcId);
    const dstNode = this.getNode(dstId);

    let usableEdge = null;
    for (const e of srcNode.edges) {
      const edge = this.getEdge(e);
      if (edge.dst == dstId) {
        usableEdge = edge;
        break;
      }
    }

    const distance = this.getDistance(srcNode.position, dstNode.position);

    let scaled = 0;
    if (usableEdge != null) {
      scaled = distance / this.getScaledSpeed(usableEdge.uses);
    } else {
      scaled = distance / this.BASE_AGENT_SPEED;
    }

    console.log(`SCALED: ${distance} => ${scaled}`)
    return scaled; 
  }

  getScaledSpeed(n: number) {
    return this.BASE_AGENT_SPEED + Math.log(n + 1) * this.USE_SPEED_SCALE;
  }

  atDestination(agent: Agent) {
    const destination = this.getNode(agent.currentDest);
    return this.getDistance(agent.position, destination.position) < this.OVERLAP_THRESHOLD;
  }

  getNextPosition(agent: Agent): Point {
    const curr = agent.position;
    const dest = this.getNode(agent.currentDest).position;
    const dist = this.getDistance(curr, dest);

    let scale = 0;
    if (agent.currentEdge) {
      const edge = this.getEdge(agent.currentEdge);
      scale = this.getScaledSpeed(edge.uses) / dist
    } else {
      scale = this.BASE_AGENT_SPEED / dist;
    }

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
      const spawnNode = _.sample(Array.from(this.nodes.values()))!;
      this.agents.set(id, {
        id: id,
        position: spawnNode.position,
        currentDest: spawnNode.id,
        finalDest: spawnNode.id,
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
    let dist = this.getScaledDistance(fromId, toId);

    for (const candidateId of from.edges) {
      const candidate = this.getEdge(candidateId)!;
      const candidateDst = this.getNode(candidate.dst);
      const scaled = this.getScaledDistance(fromId, candidateDst.id);
      const remaining = scaled + this.getScaledDistance(candidateDst.id, toId);

      if (remaining < dist) {
        dest = candidate.dst;
        dist = scaled;
        edge = candidateId;
      }
    }

    return [dest, edge];
  }

  tick(delta: number): SimUpdate {
    let update = this.spawn();
    const addedEdges: EdgeId[] = [];

    this.agents.forEach((agent, id) => {
      if (this.atDestination(agent)) {
        console.log(`Agent "${id}" reached node "${agent.finalDest}"`);
        if (agent.currentDest == agent.finalDest) {
          agent.finalDest = _.sample(Array.from(this.nodes.keys()))!;
        }
        const src = agent.currentDest;
        const nextStep = this.getNextStep(src, agent.finalDest);
        if (nextStep[0] != null) {
          if (nextStep[1] == null) {
            const id1 = this.getNextId();
            const id2 = this.getNextId();
            this.edges.set(id1, {
                id: id1,
                src: src,
                dst: nextStep[0],
                uses: 1,
                lastUse: this.elapsed,
            });
            this.edges.set(id2, {
                id: id2,
                src: nextStep[0],
                dst: src,
                uses: 1,
                lastUse: this.elapsed,
            });
            const srcNode = this.getNode(src);
            const dstNode = this.getNode(nextStep[0]);
            srcNode.edges.push(id1);
            dstNode.edges.push(id2);
            addedEdges.push(id1, id2);
          } else {
            const edge = this.getEdge(nextStep[1]);
            console.log(`USING EDGE ${edge.id} with uses ${edge.uses}`)
            edge.uses += 1;
            edge.lastUse = this.elapsed;
          }

          agent.currentDest = nextStep[0];
          agent.currentEdge = nextStep[1];
          console.log(`Agent "${id}", CURR: ${agent.currentDest}, FINAL: ${agent.finalDest}` );
        }
      }

      agent.position = this.getNextPosition(agent);
    });

    update = {...update, ...{addedEdges: addedEdges}};
    this.elapsed += 1;
    return update;
  }
}

export default Sim;