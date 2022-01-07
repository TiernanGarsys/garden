import { ColorScheme } from "color-scheme";
import React, { MouseEvent } from "react";

import './Overlay.css';
import { Settings } from '../core/Settings';
import { getPalette } from '../core/Color';
interface OverlayProps {
  settings: Settings,
  dismiss: (() => void),
  update: ((settings: Settings) => void)
}
interface OverlayState {
  settings: Settings,
}

function Overlay(props: OverlayProps) {
  const [state, setState] = React.useState<OverlayState>({ 
    settings: props.settings,
  });

  let onClickDismiss = React.useCallback((e: MouseEvent) => {
    props.dismiss();
    e.stopPropagation();
  }, [props]);

  let onClickNewColorScheme = React.useCallback((e: MouseEvent) => {
    setState({...state, ...{
      settings: {...state.settings, ... {
        palette: getPalette(),
      }},
    }});
    e.stopPropagation();
  }, [props, state, setState]);

  return (
    <div className="Overlay">
      <div className="row">
        <button className="dismiss" onClick={onClickDismiss}>
          DISMISS
        </button>
      </div>
    </div>
  );
}


export default Overlay;
