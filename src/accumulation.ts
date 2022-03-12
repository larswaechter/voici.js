import _ from 'lodash';
import { countOccurrences } from './helper';

export type DynamicColumn = {
  name: string;
  func: <T>(row: T, index: number) => unknown;
};

export type Accumulation = {
  column: string | number;
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
export const calculateAccumulation = (data: [], func: AccumulationFunction) => {
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
      return Math.max(...data);
    case AccumulationFunction.MEAN:
      return calculateMean(data);
    case AccumulationFunction.MEDIAN:
      return calculateMedian(data);
    case AccumulationFunction.MIN:
      return Math.min(...data);
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
    if (String(value).length) counter++;
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

  for (const val of data) {
    if (map.has(val)) map.set(val, map.get(val) + 1);
    else map.set(val, 1);

    if (map.get(val) > modeCount) {
      modeCount = map.get(val);
      mode = val;
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
  const product = data.reduce((prev, val) => prev * val, 1);
  return Math.pow(product, 1 / data.length);
};

/**
 * Calculates the harmonic mean.
 *
 * @param data the dataset
 * @returns the harmonic mean
 */
export const calculateHarmonicMean = (data: number[]) => {
  const sum = data.reduce((prev, val) => prev + 1 / val, 0);
  return data.length / sum;
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
 * Calculates the mean.
 *
 * @param data the dataset
 * @returns the calculated mean
 */
export const calculateMean = (data: number[]) => _.mean(data);

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
export const calculateSum = (data: number[]) => _.sum(data);

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
  return (1 / data.length) * data.reduce((prev, val) => prev + Math.pow(val - mean, 2), 0);
};
