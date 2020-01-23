import _clamp from "lodash/clamp";
import _isNil from "lodash/isNil";

export const percentToAngle = (
  percentage: number,
  maxDegrees: number = 180
): number => {
  return (maxDegrees * percentage) / 100;
};

export const circleCircumference = (radius: number): number => {
  return 2 * Math.PI * radius;
};

export const progressOfTotal = (
  progress: number,
  total: number,
  degrees: number = 180
): number => {
  const max = (360 / degrees) * 100;
  return total * (1 - progress / max);
};

// Convert value to 0-100 range of given max
export const valueAsPercentage = (
  value: number,
  {
    min,
    max
  }: {
    min: number;
    max: number;
  }
): number => {
  if (_isNil(value) || _isNil(max) || max === 0) {
    return 0;
  }
  const percentage = ((value - min) / (max - min)) * 100;
  return _clamp(percentage, 0, 100);
};
