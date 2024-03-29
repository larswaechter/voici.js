import isSet from 'lodash/isSet';
import isMap from 'lodash/isMap';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';

/**
 * Extract the types of the according attributes.
 */
export type InferAttributesTypes<T extends object, Key extends keyof T = keyof T> = T[Key];

/**
 * Convert an union to array union.
 *
 * @example
 * ```ts
 * UnionToArray<string | number> // Array<string> | Array<number>
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnionToArray<T> = T extends any ? T[] : never;

/**
 * Checks whether the given value is empty.
 *
 * @param value the value to check
 * @returns whether the value is empty
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isEmpty = (value: any) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'number' && isNaN(value)) return true;
  if (isString(value) && !value.trim().length) return true;
  if (isSet(value) && !value.size) return true;
  if (isMap(value) && !value.size) return true;
  if (typeof value === 'object' && !Object.keys(value).length) return true;

  return false;
};

/**
 * Converts the given value to a string.
 *
 * @param value the value to stringify
 * @returns the strinified value
 */
export const stringify = (value: unknown): string => {
  if (value == undefined || value == null) return '';
  if (typeof value === 'number' && isNaN(value)) return '';
  if (isString(value)) return value;
  if (isNumber(value)) return value.toString();
  if (isDate(value)) return value.toDateString();
  if (isPlainObject(value) || Array.isArray(value)) return JSON.stringify(value);
  if (isSet(value)) return JSON.stringify(Array.from(value.values()));
  if (isMap(value)) return JSON.stringify(Array.from(value.entries()));
  return String(value) || '';
};

/**
 * Counts the occurrences of each value.
 * The values `null` and `undefined` are ignored.
 *
 * @param data  the dataset
 * @returns a `Map<Value, Occurrences>` map
 */
export const countOccurrences = (data: unknown[]) => {
  const table = new Map<string, number>();

  for (const value of data) {
    if (value === null || value === undefined) continue;

    const str = String(value);
    if (str === 'undefined') continue;
    if (table.has(str)) table.set(str, table.get(str) + 1);
    else table.set(str, 1);
  }

  return table;
};

/**
 * Checks whether given `array` contains the given `val`.
 * There is NO strict comparison.
 * Can be useful when working with numeric attributes and their string counterparts.
 *
 * @param array array to search in
 * @param val value to search
 * @returns whether `val` is included or not
 */
export const arrayIncludes = (array: string[] | number[], val: string | number) => {
  for (const item of array) if (val == item) return true;
  return false;
};
