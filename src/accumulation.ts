import _isNil from 'lodash/isNil';

import { countOccurrences } from './helper';

export type Accumulation<TAttributes> = {
  column: TAttributes;
  func: AccumulationFunction;
};

export enum AccumulationFunction {
  /** The number of values (non-empty cells) */
  COUNT,

  /** The most frequent value */
  FREQ,

  /** The geometric mean */
  GEO_MEAN,

  /** The harmonic mean */
  HARM_MEAN,

  /** The most infrequent value */
  INFREQ,

  /** The maximum value */
  MAX,

  /** The mean */
  MEAN,

  /** The median */
  MEDIAN,

  /** The minimal value */
  MIN,

  /** The difference betwenn min and max */
  RANGE,

  /** The standard deviation */
  STD,

  /** The sum */
  SUM,

  /** The variance */
  VAR
}

/**
 * Gets the accumulated value using the given dataset and ComputeFunction.
 *
 * @param data the dataset
 * @param func the ComputeFunction
 * @returns the computed value
 */
export const calculateAccumulation = (data: any[], func: AccumulationFunction) => {
  if (!data.length) return null;

  switch (func) {
    case AccumulationFunction.COUNT:
      return calculateCount(data);
    case AccumulationFunction.FREQ:
      return calculateMostFrequent(data);
    case AccumulationFunction.GEO_MEAN:
      return calculateGeometricMean(data);
    case AccumulationFunction.HARM_MEAN:
      return calculateHarmonicMean(data);
    case AccumulationFunction.INFREQ:
      return calculateMostInFrequent(data);
    case AccumulationFunction.MAX:
      return calculateMax(data);
    case AccumulationFunction.MEAN:
      return calculateMean(data);
    case AccumulationFunction.MEDIAN:
      return calculateMedian(data);
    case AccumulationFunction.MIN:
      return calculateMin(data);
    case AccumulationFunction.RANGE:
      return calculateRange(data);
    case AccumulationFunction.SUM:
      return calculateSum(data);
    case AccumulationFunction.STD:
      return calculateStandardDeviation(data);
    case AccumulationFunction.VAR:
      return calculateVariance(data);
    default:
      return null;
  }
};

/**
 * Counts the number of values (non-empty cells).
 *
 * @param data the dataset
 * @returns the number of values
 */
export const calculateCount = (data: unknown[]) => {
  let counter = 0;
  for (const value of data) {
    if (!_isNil(value) && String(value).length) counter++;
  }
  return counter;
};

/**
 * Calculates the most frequent value.
 *
 * @param data the dataset
 * @returns the calculated most frequent value
 */
export const calculateMostFrequent = (data: unknown[]) => {
  const map = new Map();

  let mode: unknown;
  let modeCount = -1;

  for (const value of data) {
    if (_isNil(value)) continue;

    if (map.has(value)) map.set(value, map.get(value) + 1);
    else map.set(value, 1);

    if (map.get(value) > modeCount) {
      modeCount = map.get(value);
      mode = value;
    }
  }

  return mode;
};

/**
 * Calculates the geometric mean.
 *
 * @param data the dataset
 * @returns the geometric mean
 */
export const calculateGeometricMean = (data: number[]) => {
  let product = 1;
  let counter = 0;

  for (const value of data) {
    if (_isNil(value)) continue;
    product *= value;
    counter++;
  }

  return Math.pow(product, 1 / counter);
};

/**
 * Calculates the harmonic mean.
 *
 * @param data the dataset
 * @returns the harmonic mean
 */
export const calculateHarmonicMean = (data: number[]) => {
  let sum = 0;
  let counter = 0;

  for (const value of data) {
    if (_isNil(value)) continue;
    sum += 1 / value;
    counter++;
  }

  return counter / sum;
};

/**
 * Calculates the most infrequent value.
 *
 * @param data the dataset
 * @returns the calculated most infrequent value
 */
export const calculateMostInFrequent = (data: unknown[]) => {
  const occurrences = countOccurrences(data);

  let key = '';
  let count = Infinity;

  occurrences.forEach((_count, _key) => {
    if (_count <= count) {
      key = _key;
      count = _count;
    }
  });

  return key;
};

/**
 * Calculates the maximum value.
 *
 * @param data the dataset
 * @returns the max value
 */
export const calculateMax = (data: number[]) => {
  let max = -Infinity;

  for (const value of data) {
    if (!_isNil(value) && value > max) max = value;
  }

  return max;
};

/**
 * Calculates the mean.
 *
 * @param data the dataset
 * @returns the calculated mean
 */
export const calculateMean = (data: number[]) => {
  let sum = 0;
  let counter = 0;

  for (const value of data) {
    if (_isNil(value)) continue;
    sum += value;
    counter++;
  }

  return sum / counter;
};

/**
 * Calculates the median.
 *
 * @param data the dataset
 * @returns the calculated median
 */
export const calculateMedian = (data: number[]) => {
  const sorted = data.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2;

  return sorted[middle];
};

/**
 * Calculates the sum.
 *
 * @param data the dataset
 * @returns the calculated sum
 */
export const calculateSum = (data: number[]) => {
  let sum = 0;

  for (const value of data) {
    if (!_isNil(value)) sum += value;
  }

  return sum;
};

/**
 * Calculates the minimum value.
 *
 * @param data the dataset
 * @returns the min value
 */
export const calculateMin = (data: number[]) => {
  let min = Infinity;

  for (const value of data) {
    if (!_isNil(value) && value < min) min = value;
  }

  return min;
};

/**
 * Calculates the range (difference between min and max).
 *
 * @param data the dataset
 * @returns the calculated range
 */
export const calculateRange = (data: number[]) => {
  let min = Infinity;
  let max = -Infinity;

  for (const value of data) {
    if (_isNil(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return max - min;
};

/**
 * Calculates the standard deviation.
 *
 * @param data the dataset
 * @returns the calculated standard deviation
 */
export const calculateStandardDeviation = (data: number[]) => {
  return Math.sqrt(calculateVariance(data));
};

/**
 * Calculates the variance.
 *
 * @param data the dataset
 * @returns the calculated variance
 */
export const calculateVariance = (data: number[]) => {
  const mean = calculateMean(data);

  let sum = 0;
  let counter = 0;

  for (const value of data) {
    if (_isNil(value)) continue;
    sum += Math.pow(value - mean, 2);
    counter++;
  }

  return (1 / counter) * sum;
};
