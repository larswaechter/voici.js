import isSet from 'lodash/isSet';
import isMap from 'lodash/isMap';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';

/**
 * Converts the given value to a string.
 *
 * @param value the value to stringify
 * @returns the strinified value
 */
export const stringify = (value: unknown) => {
  if (isString(value)) return value;
  if (isNumber(value)) return value.toString();
  if (isDate(value)) return value.toDateString();
  if (isPlainObject(value) || Array.isArray(value)) return JSON.stringify(value);
  if (isSet(value)) return JSON.stringify(Array.from(value.values()));
  if (isMap(value)) return JSON.stringify(Array.from(value.entries()));
  if (value == undefined || value == null) return '';
  return String(value) || '';
};

/**
 * Counts the occurrences of each value.
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
