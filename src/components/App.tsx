import { useCallback, useEffect, useState} from "react";
import classNames from "classnames";

import Display from './Display'
import Overlay from './Overlay'
import { Settings, defaultSettings } from '../core/Settings'
import './App.css'

const MESSAGE_FADE_TIMEOUT_MS: number = 3 * 1000;

interface AppState {
  settings: Settings,
  showMessage: boolean,
  showOverlay: boolean,
}

function App() {
  const defaults = defaultSettings();
  const [state, setState] = useState<AppState>({ 
    settings: defaults,
    showMessage: true,
    showOverlay: false,
  });

  const onKeyDown = useCallback(() => {
    setState({...state, ...{showOverlay: true, showMessage: false}});
  }, [state, setState]);

  const onClick = useCallback(() => {
    console.log("TODO: Add click behavior");
  }, [state, setState]);

  const overlayUpdate = useCallback((settings: Settings) => {
    setState({...state, ...{settings: settings}});
  }, [state, setState]);

  const overlayDismiss = useCallback(() => {
    setState({...state, ...{showMessage: true, showOverlay: false}});
  }, [state, setState]);

  /*
  useEffect(() => {  
    window.addEventListener("keydown", onKeyDown, true);  
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onKeyDown]);
  */

  return (
    <div className="App" 
         onClick={onClick}>
      <div className={classNames("message", {
        "fadeout": !state.showMessage
      })}>Press key for settings</div>
      {state.showOverlay && 
        <Overlay 
          settings={state.settings}
          update={overlayUpdate}
          dismiss={overlayDismiss}/>
      }
      <Display settings={state.settings}/>
    </div>
  );
}

export default App;