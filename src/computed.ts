import _ from 'lodash';
import { countOccurrences } from './helper';

export type ComputedCell = {
  column: string | number;
  func: ComputeFunction;
};

export enum ComputeFunction {
  /** The minimal value */
  MIN,

  /** The maximum value */
  MAX,

  /** The sum */
  SUM,

  /** The mean */
  MEAN,

  /** The median */
  MEDIAN,

  /** The variance */
  VAR,

  /** The standard deviation */
  STD,

  /** The difference betwenn min and max */
  RANGE,

  /** The number of values (non-empty cells) */
  COUNT,

  /** The most frequent value */
  FREQ,

  /** The most infrequent value */
  INFREQ
}

/**
 * Gets the computed value using the given dataset and ComputeFunction.
 *
 * @param data the dataset
 * @param func the ComputeFunction
 * @returns the computed value
 */
export const getComputed = (data: [], func: ComputeFunction) => {
  switch (func) {
    case ComputeFunction.MIN:
      return Math.min(...data);
    case ComputeFunction.MAX:
      return Math.max(...data);
    case ComputeFunction.SUM:
      return calculateSum(data);
    case ComputeFunction.MEAN:
      return calculateMean(data);
    case ComputeFunction.MEDIAN:
      return calculateMedian(data);
    case ComputeFunction.VAR:
      return calculateVariance(data);
    case ComputeFunction.STD:
      return calculateStandardDeviation(data);
    case ComputeFunction.RANGE:
      return calculateRange(data);
    case ComputeFunction.COUNT:
      return calculateCount(data);
    case ComputeFunction.FREQ:
      return calculateMostFrequent(data);
    case ComputeFunction.INFREQ:
      return calculateMostInFrequent(data);
    default:
      return 0;
  }
};

/**
 * Calculates the sum.
 *
 * @param data the dataset
 * @returns the calculated sum
 */
export const calculateSum = (data: number[]) => _.sum(data);

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
  if (!data.length) return 0;

  const sorted = data.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2;

  return sorted[middle];
};

/**
 * Calculates the variance.
 *
 * @param data the dataset
 * @returns the calculated variance
 */
export const calculateVariance = (data: number[]) => {
  if (!data.length) return 0;

  const mean = calculateMean(data);
  return (1 / data.length) * data.reduce((prev, val) => prev + Math.pow(val - mean, 2), 0);
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
 * Calculates the range (difference between min and max).
 *
 * @param data the dataset
 * @returns the calculated range
 */
export const calculateRange = (data: number[]) => {
  if (!data.length) return 0;

  let min = Infinity;
  let max = -Infinity;

  for (const value of data) {
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return max - min;
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
  const occurrences = countOccurrences(data);

  let key = '';
  let count = -Infinity;

  occurrences.forEach((_count, _key) => {
    if (_count >= count) {
      key = _key;
      count = _count;
    }
  });

  return key;
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
