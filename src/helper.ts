import isSet from 'lodash/isSet';
import isMap from 'lodash/isMap';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';

import * as csv from 'fast-csv';
import * as jstream from 'JSONStream';
import { resolve as resolvePath } from 'path';
import { createReadStream } from 'fs';

import { Config } from './config';
import { Row, Table } from './table';

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
 * Creates a new `Table` instance from a .csv file stream.
 *
 * @param path the .csv filepath
 * @param csvConfig the fast-csv config
 * @param tableConfig the table config
 * @returns a new `Table` instance
 */
export const fromCSV = <TRow extends Row, TDColumns extends object = never>(
  path: string,
  csvConfig: csv.ParserOptionsArgs,
  tableConfig: Config<TRow, TDColumns> = {}
): Promise<Table<TRow, TDColumns>> => {
  return new Promise((resolve, reject) => {
    const data: TRow[] = [];
    createReadStream(resolvePath(path))
      .pipe(csv.parse(csvConfig))
      .on('error', (err) => {
        reject(err);
      })
      .on('data', (row: TRow) => {
        data.push(row);
      })
      .on('end', () => {
        resolve(new Table(data, tableConfig));
      });
  });
};

/**
 * Creates a new `Table` instance from a .json file stream.
 *
 * @param path the .json filepath
 * @param tableConfig the table config
 * @returns a new `Table` instance
 */
export const fromJSON = <TRow extends Row, TDColumns extends object = never>(
  path: string,
  tableConfig: Config<TRow, TDColumns> = {}
): Promise<Table<TRow, TDColumns>> => {
  return new Promise((resolve, reject) => {
    const data: TRow[] = [];
    createReadStream(resolvePath(path))
      .pipe(jstream.parse('*'))
      .on('error', (err: Error) => {
        reject(err);
      })
      .on('data', (row: TRow) => {
        data.push(row);
      })
      .on('end', () => {
        resolve(new Table(data, tableConfig));
      });
  });
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
