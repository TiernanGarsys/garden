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

    const processSimUpdate= (update: SimUpdate) => {
      for (let id of update.addedEdges) {
        let frame = {
          id: id,
          ctx: new Graphics(),
        };
        edges.set(id, frame);
        frame.ctx.lineStyle({ color: 0x00ff00, width: 2, alignment: 0 });
        app.stage.addChild(frame.ctx);
      }
      for (let id of update.addedNodes) {
        let frame = {
          id: id,
          ctx: new Graphics(),
        };
        nodes.set(id, frame);
        frame.ctx.lineStyle({ color: 0xff0000, width: 2, alignment: 0 });
        app.stage.addChild(frame.ctx);
      }
      for (let id of update.addedAgents) {
        let frame = {
          id: id,
          ctx: new Graphics(),
        };
        agents.set(id, frame);
        frame.ctx.lineStyle({ color: 0x0000ff, width: 4, alignment: 0 });
        app.stage.addChild(frame.ctx);
      }
      for (let id in update.removedAgents) {
        agents.delete(id);
      }
      for (let id in update.removedNodes) {
        nodes.delete(id);
      }
      for (let id in update.removedEdges) {
        edges.delete(id);
      }
    }
   
    const debug = new Graphics();
    app.stage.addChild(debug);

    const redraw = () => {
      debug.clear();
      debug.lineStyle({ color: 0xffffff, width: 2, alignment: 0 });
      debug.drawCircle(100, 100, 2);
      debug.drawCircle(100, 200, 3);
      debug.drawCircle(200, 300, 4);
      debug.drawCircle(100, 300, 5);
      debug.drawCircle(100, 400, 7);
      debug.position.set(0, 0);

      const height = window.innerHeight;
      const width = window.innerWidth;

      edges.forEach((frame, id) => {
        const seg = state.sim.getEdgePosition(id);

        const ax = seg[0][0] * width;
        const ay = seg[0][1] * height;
        const bx = seg[1][0] * width - ax;
        const by = seg[1][1] * height - ay;

        frame.ctx.position.set(ax, ay);
        frame.ctx.lineTo(bx, by);
      });
      nodes.forEach((frame, id) => {
        const pos = state.sim.getNodePosition(id);
        frame.ctx.position.set(pos[0] * width, pos[1] * height);
        frame.ctx.drawCircle(0, 0, 5);
      });
      agents.forEach((frame, id) => {
        const pos = state.sim.getAgentPosition(id);
        frame.ctx.position.set(pos[0] * width, pos[1] * height);
        frame.ctx.drawCircle(0, 0, 5);
      });
    }

    let elapsed = 0
    let initialTick = true;
    app.ticker.add((delta) => {
      let update: SimUpdate;
      if (initialTick) {
        update = state.sim.initTest();
        initialTick = false;
      } else {
        update = state.sim.tick(delta);
      }

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
