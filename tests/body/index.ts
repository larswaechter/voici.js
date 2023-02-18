import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';
import { arrData } from '../data';

describe('Body', () => {
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
