import classNames from "classnames";
import React, { MouseEvent } from "react";

import Display from './Display'
import { Settings } from '../core/Settings'

interface OverlayProps {
  enabled: boolean,
  dismiss: (() => void),
  update: ((settings: Settings) => void)
}

function Overlay(props: OverlayProps) {

  let onClickDismiss = React.useCallback((e: MouseEvent) => {
    props.dismiss();
    e.stopPropagation();
  }, [props]);

  return (
    <div className={classNames("Overlay", {
      enabled: props.enabled,
    })}>
      <button className="dismiss" onClick={onClickDismiss}>
        DISMISS
      </button>
      <div>HELLO</div>
    </div>
  );
}


export default Overlay;
