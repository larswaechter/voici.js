/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';
import { arrData, defaultData } from '../data';

describe('Body', () => {
  it('Fill empty', () => {
    const data = [
      { firstname: 'Jane', lastname: 'Doe', gender: 'Female', age: 28, friends: ['John'] },
      { firstname: 'John', lastname: 'Doe', gender: 'Male', age: 26, friends: [] },
      { firstname: 'Subject', lastname: 'A', gender: '', age: NaN, friends: [] },
      { firstname: 'Subject', lastname: 'B', gender: NaN, friends: [] },
      { firstname: 'Subject', lastname: 'C', gender: NaN, friends: [] }
    ];

    const table = new voici.Table(data, {
      body: {
        fillEmpty: {
          gender: () => 'none',
          age: () => 99,
          friends: () => ['Jane']
        }
      }
    });

    const result = readFileSync(__dirname + '/fill_empty.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Filter row', () => {
    const table = new voici.Table(defaultData, {
      body: {
        filterRow: (row) => row.gender === 'Male'
      }
    });

    const result = readFileSync(__dirname + '/filter_row.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Filter dynamic row', () => {
    interface IDummy {
      fullname: string;
    }

    const table = new voici.Table<(typeof defaultData)[number], IDummy>(defaultData, {
      header: {
        dynamic: {
          fullname: (row) => row.firstname + ' ' + row.lastname
        }
      },
      body: {
        filterRow: (row) => row.fullname === 'Lois Lane'
      }
    });

    const result = readFileSync(__dirname + '/filter_dynamic_row.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Precision', () => {
    const data = [
      [0.1, 0.435342, -12.4114],
      [5.9651, -0.6525, 3158.23]
    ];

    const table = new voici.Table(data, {
      body: {
        precision: 2
      }
    });

    const result = readFileSync(__dirname + '/precision.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Subset Max', () => {
    const table = new voici.Table(arrData, {
      body: {
        subset: [3]
      }
    });

    const result = readFileSync(__dirname + '/subset_max.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Subset MinMax', () => {
    const table = new voici.Table(arrData, {
      body: {
        subset: [2, 4]
      }
    });

    const result = readFileSync(__dirname + '/subset_min_max.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });
});
