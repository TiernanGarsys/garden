import React, { useRef, useEffect } from "react";
import { Application, Graphics } from "pixi.js";

import { Palette, getPalette } from '../core/Color';

interface DisplayProps {
  palette: Palette,
}

function Display(props: DisplayProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = new Application({
      resizeTo: window,
      backgroundColor: props.palette.background,
    });

    let frame = new Graphics();
    frame.beginFill(0x666666);
    frame.lineStyle({ color: 0xffffff, width: 4, alignment: 0 });
    frame.drawRect(0, 0, 208, 208);
    frame.position.set(320 - 100, 180 - 100);
    app.stage.addChild(frame);

    // Add a ticker callback to move the sprite back and forth
    let elapsed = 0.0;
    app.ticker.add((delta) => {
      frame.position.set(100.0 + Math.cos(elapsed/50.0) * 100.0, 200);
      elapsed += delta;
    });

    ref.current!.appendChild(app.view);
    app.start();

    return () => {
      app.destroy(true, true);
    };
  }, [props.palette]);
 
  return <div ref={ref} />;
}


export default Display;
