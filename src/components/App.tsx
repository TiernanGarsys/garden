import React from "react";

import Display from './Display'
import Overlay from './Overlay'
import { Settings, defaultSettings } from '../core/Settings'

interface AppState {
  showOverlay: boolean,
  settings: Settings
}

function App() {
  const [state, setState] = React.useState<AppState>({ 
    showOverlay: false,
    settings: defaultSettings(),
  })

  let overlayUpdate = React.useCallback((settings: Settings) => {
    setState({ 
      settings: settings,
      showOverlay: state.showOverlay,
    });
  }, [state, setState])

  let overlayDismiss = React.useCallback(() => {
    setState({ 
      settings: state.settings,
      showOverlay: false
    });
  }, [state, setState])

  let onClick = React.useCallback(() => {
    setState({ 
      settings: state.settings,
      showOverlay: true
    });
  }, [state, setState])

  return (
    <div onClick={onClick}>
      <Overlay 
        enabled={state.showOverlay} 
        update={overlayUpdate}
        dismiss={overlayDismiss}
      />
      <Display bgColor={state.settings.bgColor}/>
    </div>
  );
}


export default App;
