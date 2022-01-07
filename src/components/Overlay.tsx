import { ColorScheme } from "color-scheme";
import React, { MouseEvent } from "react";

import './Overlay.css';
import { Settings } from '../core/Settings';

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

  let onClickUpdate = React.useCallback((e: MouseEvent) => {
    props.update(state.settings)
    e.stopPropagation();
  }, [props, state]);

  let onClickNewColorScheme = React.useCallback((e: MouseEvent) => {
    var scheme = new ColorScheme();
    scheme.from_hue(21)         
          .scheme('triade')   
          .variation('soft');
    setState({...state, ...{
      settings: {...state.settings, ... {
        bgColor: scheme.colors[0],
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
      <div className="row">
        <button className="update" onClick={onClickUpdate}>
          UPDATE
        </button>
      </div>
    </div>
  );
}


export default Overlay;
