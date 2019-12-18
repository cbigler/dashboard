
// https://www.tableau.com/about/blog/2016/7/colors-upgrade-tableau-10-56782
export const COLORS = [
  '#5581FF', '#F4AB4E',
  '#AB67B5', '#FF624D',
  '#249F70', '#2749AA',
  '#C07619', '#7A3A84',
  '#B4301E', '#09613F'
] as const;

export const OVERFLOW_COLOR = '#555555';

type ColorString = typeof COLORS[number] | typeof OVERFLOW_COLOR;

export class ColorManager {
  private _colors: ColorString[]
  private _pool: ColorString[]

  constructor(colors: ColorString[]) {
    this._colors = colors;
    this._pool = this._colors.slice();
  }
  public next() {
    const nextColor = this._pool.shift();
    return nextColor != null ? nextColor : OVERFLOW_COLOR
  }

  public reset() {
    this._pool = this._colors.slice();
  }
}

export function colorScale(colors: ColorString[]) {

  const colorManager = new ColorManager(colors);

  const mapping: {[id: string]: ColorString} = {};

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
