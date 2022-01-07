
import { Palette, getPalette } from './Color';
export interface Settings {
  running: boolean,
  palette: Palette,
}

export function defaultSettings(): Settings {
  return {
    running: true,
    palette: getPalette(),
  }
}
