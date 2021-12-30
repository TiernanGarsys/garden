import React from "react";

import Display from './Display'
import { Settings, defaultSettings } from '../core/Settings'

interface AppState {
  settings: Settings
}

function App() {
  const [state, setState] = React.useState({ 
    settings: defaultSettings(),
  })

  return (
    <div>
      <Display bgColor={state.settings.bgColor}/>
    </div>
  );
}


export default App;
