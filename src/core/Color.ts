type Color = number;

export interface Palette {
  background: Color,
  node: Color,
  edge: Color,
  agent: Color[],
}

export function getPalette(): Palette {
  // TODO(tiernan): Add dynamic palettes
  return {
    background: 0x222222,
    node: 0x444444,
    edge: 0x666666,
    agent: [
      0x448B6B,
      0x4DC5CA,
      0xF0C165,
      0xEC4238,
    ],
  }
}