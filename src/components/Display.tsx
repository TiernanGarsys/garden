import React, { useRef, useEffect, useState} from "react";
import { Application, Graphics } from "pixi.js";

import { Palette } from '../core/Color';
import { Settings } from '../core/Settings';
import Sim, { AgentId, NodeId, EdgeId, SimUpdate } from "../core/Sim";

interface DisplayProps {
  settings: Settings,
}

interface AgentFrame {
  id: AgentId,
  ctx: Graphics,
}

interface NodeFrame {
  id: NodeId,
  ctx: Graphics,
}

interface EdgeFrame {
  id: EdgeId,
  ctx: Graphics,
}

interface DisplayState {
  sim: Sim,
}

function Display(props: DisplayProps) {
  const [state, _] = useState<DisplayState>({ 
    sim: new Sim(props.settings),
  });

  const agents = new Map<AgentId, AgentFrame>();
  const nodes = new Map<NodeId, NodeFrame>();
  const edges = new Map<EdgeId, EdgeFrame>();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = new Application({
      resizeTo: window,
      backgroundColor: props.settings.palette.background,
    });

    const agentLayer = new Graphics();
    const nodeLayer = new Graphics();
    const edgeLayer = new Graphics();

    agentLayer.addChild(nodeLayer);
    nodeLayer.addChild(edgeLayer);
    app.stage.addChild(agentLayer);

    const processSimUpdate= (update: SimUpdate) => {
      const height = window.innerHeight;
      const width = window.innerWidth;

      for (const id of update.addedAgents) {
        const frame = {
          id: id,
          ctx: new Graphics(),
        };
        agents.set(id, frame);
        frame.ctx.lineStyle({ color: 0xAA0000, width: 2, alignment: 0 });
        frame.ctx.drawCircle(0, 0, 5);
        agentLayer.addChild(frame.ctx);
      }
      for (const id of update.addedEdges) {
        const frame = {
          id: id,
          ctx: new Graphics(),
        };
        edges.set(id, frame);
        frame.ctx.lineStyle({ color: 0xFFFFFF, width: 1, alignment: 0 });
        const edge = state.sim.getEdge(id);
        const n1 = state.sim.getNode(edge.src);
        const n2 = state.sim.getNode(edge.dst);

        const ax = n1.position[0] * width;
        const ay = n1.position[1] * height;
        const bx = n2.position[0] * width - ax;
        const by = n2.position[1] * height - ay;

        frame.ctx.position.set(ax, ay);
        frame.ctx.lineTo(bx, by);
        edgeLayer.addChild(frame.ctx);
      }
      for (const id of update.addedNodes) {
        const frame = {
          id: id,
          ctx: new Graphics(),
        };
        nodes.set(id, frame);
        frame.ctx.lineStyle({ color: 0x888888, width: 1, alignment: 0 });
        frame.ctx.drawCircle(0, 0, 5);
        nodeLayer.addChild(frame.ctx);
      }
      for (const id in update.removedAgents) {
        agents.delete(id);
      }
      for (const id in update.removedNodes) {
        nodes.delete(id);
      }
      for (const id in update.removedEdges) {
        edges.delete(id);
      }
    }
   
    const debug = new Graphics();
    app.stage.addChild(debug);

    const redraw = () => {
      // TODO(tiernan): Detect resize gracefully
      const height = window.innerHeight;
      const width = window.innerWidth;

      nodes.forEach((frame, id) => {
        const node = state.sim.getNode(id);
        frame.ctx.position.set(node.position[0] * width, node.position[1] * height);
      });
      agents.forEach((frame, id) => {
        const agent = state.sim.getAgent(id);
        frame.ctx.position.set(agent.position[0] * width, agent.position[1] * height);
      });
    }

    app.ticker.add((delta) => {
      const update = state.sim.tick(delta);
      processSimUpdate(update);
      redraw();
    });

    const onResize = () => {
      // TODO(tiernan): Implement
    }
    onResize();


    ref.current!.appendChild(app.view);
    app.start();

    return () => {
      app.destroy(true, true);
    };
  }, [props, state]);
 
  return <div ref={ref} />;
}


export default Display;
