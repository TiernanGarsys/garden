export interface Settings {
  bgColor: number,
}

export function defaultSettings(): Settings {
  return {
    bgColor: 0x223322,
  }
}
