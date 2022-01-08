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
  frame: Graphics,
}

interface NodeFrame {
  id: NodeId,
  frame: Graphics,
}

interface EdgeFrame {
  id: EdgeId,
  frame: Graphics,
}

interface DisplayState {
  sim: Sim,
  agents: Map<AgentId, AgentFrame>,
  nodes: Map<NodeId, NodeFrame>,
  edges: Map<EdgeId, EdgeFrame>,
}

function Display(props: DisplayProps) {
  const [state, _] = useState<DisplayState>({ 
    sim: new Sim(props.settings),
    agents: new Map<AgentId, AgentFrame>(),
    nodes: new Map<NodeId, NodeFrame>(),
    edges: new Map<EdgeId, EdgeFrame>(),
  });

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
      for (let id in update.addedAgents) {

      }
      for (let id in update.addedNodes) {

      }
      for (let id in update.addedEdges) {

      }
      for (let id in update.removedAgents) {

      }
      for (let id in update.removedNodes) {

      }
      for (let id in update.removedEdges) {

      }
    }

    let initialTick = true;
    app.ticker.add((delta) => {
      let update: SimUpdate;
      if (initialTick) {
        update = state.sim.initTest();
      } else {
        update = state.sim.tick(delta);
      }
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
