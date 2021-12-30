import React from "react";

import Display from './Display'

function App() {
  const [state, setState] = React.useState({ 
    bgColor: 0x666633,
  })

  return (
    
    <div>
      <Display bgColor={state.bgColor}/>
    </div>
  );
}


export default App;
