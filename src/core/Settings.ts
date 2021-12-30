export interface Settings {
  running: boolean,
  bgColor: number,
}

export function defaultSettings(): Settings {
  return {
    running: true,
    bgColor: 0x223322,
  }
}
