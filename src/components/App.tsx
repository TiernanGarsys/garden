import { useCallback, useEffect, useState} from "react";
import classNames from "classnames";

import Display from './Display'
import Overlay from './Overlay'
import { Settings, defaultSettings } from '../core/Settings'
import Sim from '../core/Sim'
import './App.css'

const MESSAGE_FADE_TIMEOUT_MS: number = 3 * 1000;

interface AppState {
  settings: Settings,
  sim: Sim,
  showMessage: boolean,
  showOverlay: boolean,
}

function App() {
  const defaults = defaultSettings();
  const [state, setState] = useState<AppState>({ 
    settings: defaults,
    sim: new Sim(defaults),
    showMessage: true,
    showOverlay: false,
  });

  let onKeyDown = useCallback(() => {
    setState({...state, ...{showOverlay: true}});
  }, [state, setState]);

  useEffect(() => {  
    window.addEventListener("keydown", onKeyDown, true);  
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onKeyDown]);

  const fadeCallback = () => setState({...state, ...{showMessage: false}});

  // TODO(tiernan): figure out the type here.
  let messageTimeout: any;
  useEffect(() => {  
    messageTimeout = setTimeout(fadeCallback, MESSAGE_FADE_TIMEOUT_MS);
    return () => clearTimeout(messageTimeout);
  }, [state, setState]);

  let onMouseMove = useCallback(() => {
    setState({...state, ...{showMessage: true}});

    if (messageTimeout) {
      clearTimeout(messageTimeout);
      messageTimeout = setTimeout(fadeCallback, MESSAGE_FADE_TIMEOUT_MS);
    } 
  }, [state, setState]);

  let onClick = useCallback(() => {
    console.log("TODO: Add click behavior");
  }, [state, setState]);

  let overlayUpdate = useCallback((settings: Settings) => {
    setState({...state, ...{settings: settings}});
    state.sim.setSettings(settings);
  }, [state, setState]);

  let overlayDismiss = useCallback(() => {
    setState({...state, ...{showMessage: true, showOverlay: false}});
  }, [state, setState]);

  useEffect(() => {  
    window.addEventListener("keydown", onKeyDown, true);  
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onKeyDown]);

  return (
    <div className="App" 
         onClick={onClick}
         onMouseMove={onMouseMove}>
      <div className={classNames("message", {
        "fadeout": !state.showMessage
      })}>Press key for settings</div>
      {state.showOverlay && 
        <Overlay 
          settings={state.settings}
          update={overlayUpdate}
          dismiss={overlayDismiss}/>
      }
      <Display palette={state.settings.palette}/>
    </div>
  );
}

export default App;