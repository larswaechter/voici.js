import * as csv from 'fast-csv';
import * as jstream from 'JSONStream';
import { resolve as resolvePath } from 'path';
import { createReadStream } from 'fs';

import { Config, Row, Table } from '.';

/**
 * Counts the occurrences of each value.
 *
 * @param data  the dataset
 * @returns a `Map<Value, Occurrences>` map
 */
export const countOccurrences = (data: unknown[]) => {
  const table = new Map<string, number>();

  for (const value of data) {
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
export const fromCSV = <T extends unknown[] | object = Row>(
  path: string,
  csvConfig: csv.ParserOptionsArgs,
  tableConfig: Config = {}
): Promise<Table<T>> => {
  return new Promise((resolve, reject) => {
    const data: T[] = [];
    createReadStream(resolvePath(path))
      .pipe(csv.parse(csvConfig))
      .on('error', (err) => {
        reject(err);
      })
      .on('data', (row: T) => {
        data.push(row);
      })
      .on('end', () => {
        resolve(new Table<T>(data, tableConfig));
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
export const fromJSON = <T extends unknown[] | object = Row>(
  path: string,
  tableConfig: Config = {}
): Promise<Table<T>> => {
  return new Promise((resolve, reject) => {
    const data: T[] = [];
    createReadStream(resolvePath(path))
      .pipe(jstream.parse('*'))
      .on('error', (err: Error) => {
        reject(err);
      })
      .on('data', (row: T) => {
        data.push(row);
      })
      .on('end', () => {
        resolve(new Table(data, tableConfig));
      });
  });
};
