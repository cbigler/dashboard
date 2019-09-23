type HexColor = string;

// https://www.tableau.com/about/blog/2016/7/colors-upgrade-tableau-10-56782
export const COLORS: HexColor[] = [
  '#4e79a7', '#f28e2c',
  '#e15759', '#76b7b2',
  '#59a14f', '#edc949',
  '#af7aa1', '#ff9da7',
  '#9c755f', '#bab0ab'
];

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function colorChannelToHex(channelValue: number) {
  // wrap to 256
  const normalized = channelValue % 0xff;
  const hex = normalized.toString(16);
  return hex.length === 2 ? hex : ('0' + hex);
}

function getRandomColor(): HexColor {
  return [...Array(3)]
    .map(_ => randomInt(0xff))
    .map(colorChannelToHex)
    .reduce((a, b) => a + b, '#')
}

class ColorManager {
  private _colors: HexColor[]
  private _pool: HexColor[]

  constructor(colors: HexColor[]) {
    this._colors = colors;
    this._pool = this._colors.slice();
  }
  public next() {
    const nextColor = this._pool.shift();
    return nextColor != null ? nextColor : getRandomColor()
  }

  public reset() {
    this._pool = this._colors.slice();
  }
}

export function colorScale(colors: HexColor[]) {

  const colorManager = new ColorManager(colors);

  const mapping: {[id: string]: HexColor} = {};

  function assign(id: string) {
    mapping[id] = colorManager.next();
  }

  function scale(id: string) {
    if (!mapping.hasOwnProperty(id)) assign(id);
    return mapping[id];
  }
  
  scale.reset = () => {
    Object.keys(mapping).forEach(k => delete mapping[k]);
    colorManager.reset();
    return scale;
  }

  return scale;
}

export default colorScale(COLORS);
