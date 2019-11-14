import { Point2D } from '../../types/geometry';

/**
 * Given a mouse event and an SVG-namespaced element, this function gives the 
 * mouse coordinates relative to the top-left corner of the element
 * 
 * Note: the element may be any SVG element, including the document itself
 */
export function mousePointRelativeToSVGElement(event: MouseEvent, container: SVGElement | SVGGraphicsElement): Point2D {

  let svg = container.ownerSVGElement;
  if (svg === null) {
    svg = container as SVGSVGElement;
  }

  if (svg.createSVGPoint && window.SVGGraphicsElement && container instanceof window.SVGGraphicsElement) {
    let point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const screenCTM = container.getScreenCTM();
    if (screenCTM) {
      point = point.matrixTransform(screenCTM.inverse());
      return {
        x: point.x,
        y: point.y,
      };
    }
  }
  const rect = container.getBoundingClientRect();

  const x = event.clientX - rect.left - container.clientLeft
  const y = event.clientY - rect.top - container.clientTop

  return {x, y};
}