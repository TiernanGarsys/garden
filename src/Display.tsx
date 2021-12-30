import React, { useRef, useEffect } from "react";
import { Application } from "pixi.js";

interface DisplayProps {
  bgColor: number,
}

function Display(props: DisplayProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = new Application({
      resizeTo: window,
      backgroundColor: props.bgColor,
    });

    ref.current!.appendChild(app.view);
    app.start();

    return () => {
      app.destroy(true, true);
    };
  }, [props.bgColor]);
 
  return <div ref={ref} />;
}


export default Display;
