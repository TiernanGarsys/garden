import * as PIXI from "pixi.js";

import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const ref = useRef(null);

  useEffect(() => {
    // On first render create our application
    const app = new Application({
      width: 800,
      height: 600,
      backgroundColor: 0x5BBA6F,
    });

    // Add app to DOM
    ref.current.appendChild(app.view);
    // Start the PixiJS app
    app.start();

    return () => {
      // On unload completely destroy the application and all of it's children
      app.destroy(true, true);
    };
  }, []);
 
  return (
    <div className="App" >
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
