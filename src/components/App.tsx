import { useCallback, useEffect, useState} from "react";

import Display from './Display'
import Overlay from './Overlay'
import { Settings, defaultSettings } from '../core/Settings'
import './App.css'

interface AppState {
  showOverlay: boolean,
  settings: Settings
}

function App() {
  const [state, setState] = useState<AppState>({ 
    showOverlay: false,
    settings: defaultSettings(),
  });

  let onKeyDown = useCallback(() => {
    setState({ 
      settings: state.settings,
      showOverlay: true,
    });
  }, [state]);

  useEffect(() => {  
    window.addEventListener("keydown", onKeyDown, true);  
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onKeyDown]);

  let onClick = useCallback(() => {
  }, [state, setState]);

  let overlayUpdate = useCallback((settings: Settings) => {
    setState({ 
      settings: settings,
      showOverlay: state.showOverlay,
    });
  }, [state, setState]);

  let overlayDismiss = useCallback(() => {
    setState({ 
      settings: state.settings,
      showOverlay: false
    });
  }, [state, setState]);

  return (
    <div className="App">
      {!state.showOverlay && 
        <div className="message">Press key for settings</div>
      }
      {state.showOverlay && 
        <Overlay 
          settings={state.settings}
          update={overlayUpdate}
          dismiss={overlayDismiss}/>
      }
      <Display bgColor={state.settings.bgColor}/>
    </div>
  );
}


export default App;
