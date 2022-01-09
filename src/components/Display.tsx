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
  gfx: Graphics,
}

interface NodeFrame {
  id: NodeId,
  gfx: Graphics,
}

interface EdgeFrame {
  id: EdgeId,
  gfx: Graphics,
}

interface DisplayState {
  sim: Sim,
}

function Display(props: DisplayProps) {
  const [state, _] = useState<DisplayState>({ 
    sim: new Sim(props.settings),
  });

  let agents = new Map<AgentId, AgentFrame>();
  let nodes = new Map<NodeId, NodeFrame>();
  let edges = new Map<EdgeId, EdgeFrame>();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = new Application({
      resizeTo: window,
      backgroundColor: props.settings.palette.background,
    });

    let frame = new Graphics();
    frame.beginFill(0x666666);
    frame.lineStyle({ color: 0xffffff, width: 4, alignment: 0 });
    frame.drawRect(0, 0, 208, 208);
    frame.position.set(320 - 100, 180 - 100);
    app.stage.addChild(frame);

    const processSimUpdate= (update: SimUpdate) => {
      console.log(`processing update { update }`);
      for (let id of update.addedAgents) {
        let frame = {
          id: id,
          gfx: new Graphics(),
        };
        frame.gfx.beginFill(props.settings.palette.agent[0]);
        frame.gfx.position.set(-100, -100);
        agents.set(id, frame);
        app.stage.addChild(frame.gfx);
      }
      for (let id of update.addedNodes) {
        let frame = {
          id: id,
          gfx: new Graphics(),
        };
        frame.gfx.beginFill(props.settings.palette.node);
        frame.gfx.position.set(-100, -100);
        nodes.set(id, frame);
        app.stage.addChild(frame.gfx);
      }
      for (let id of update.addedEdges) {
        let frame = {
          id: id,
          gfx: new Graphics(),
        };
        frame.gfx.beginFill(props.settings.palette.edge);
        frame.gfx.lineStyle({ color: props.settings.palette.edge, width: 2, alignment: 0 });
        frame.gfx.position.set(-100, -100);
        edges.set(id, frame);
        app.stage.addChild(frame.gfx);
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

    const updatePositions = () => {
      console.log('Updating positions');
      const height = window.innerHeight;
      const width = window.innerWidth;
      edges.forEach((frame, id) => {
        console.log(id);
        const seg = state.sim.getEdgePosition(id);
        frame.gfx.clear();
        frame.gfx.position.set(seg[0][0] * width, seg[0][1] * height);
        frame.gfx.lineTo(seg[1][0] * width, seg[1][1] * height);
      });
      nodes.forEach((frame, id) => {
        console.log(`Updating Node { id }`);
        const pos = state.sim.getNodePosition(id);
        frame.gfx.position.set(pos[0] * width, pos[1] * height);
      });
      agents.forEach((frame, id) => {
        const pos = state.sim.getAgentPosition(id);
        frame.gfx.position.set(pos[0] * width, pos[1] * height);
      });
    }

    let elapsed = 0
    let initialTick = true;
    app.ticker.add((delta) => {
      frame.position.set(100.0 + Math.cos(elapsed/50.0) * 100.0, 200);
      elapsed += delta;

      let update: SimUpdate;
      if (initialTick) {
        update = state.sim.initTest();
        initialTick = false;
      } else {
        update = state.sim.tick(delta);
      }

      processSimUpdate(update);
      updatePositions();
    });


    ref.current!.appendChild(app.view);
    app.start();

    return () => {
      app.destroy(true, true);
    };
  }, [props, state]);
 
  return <div ref={ref} />;
}


export default Display;
