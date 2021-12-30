import React, { useRef, useEffect } from "react";
import { Application } from "pixi.js";

function App() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = new Application({
      width: 800,
      height: 600,
      backgroundColor: 0x5BBA6F,
    });

    ref.current!.appendChild(app.view);
    app.start();

    return () => {
      app.destroy(true, true);
    };
  }, []);
 
  return <div ref={ref} />;
}

export default App;
