import { MAX_LONG_EDGE_PX, MIN_LONG_EDGE_PX, UPSCALE_TARGET_PX } from '../../constants';
import type { Dimensions } from './types';

function scaleToLongEdge(
  current: Dimensions,
  longEdge: number,
  targetLongEdge: number,
): Dimensions {
  const scale = targetLongEdge / longEdge;
  return {
    width: Math.round(current.width * scale),
    height: Math.round(current.height * scale),
  };
}

export function resolveResizeDimensions(current: Dimensions): Dimensions {
  const longEdge = Math.max(current.width, current.height);

  if (longEdge > MAX_LONG_EDGE_PX) {
    return scaleToLongEdge(current, longEdge, MAX_LONG_EDGE_PX);
  }

  if (longEdge < MIN_LONG_EDGE_PX) {
    return scaleToLongEdge(current, longEdge, UPSCALE_TARGET_PX);
  }

  return current;
}
