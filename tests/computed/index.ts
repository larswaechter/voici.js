import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';

const data = [[2], [7], [15], [3], [201], [87], [42]];

const config: voici.Config = {
  header: {
    numeration: false
  }
};

describe('Computed table', () => {
  it('COUNT', () => {
    const countData = [[2], [7], [], [3], [201], [], [42]];

    const table = new voici.Table(countData, {
      ...config,
      calculated: {
        columns: [
          {
            column: 0,
            func: voici.CalculateFunction.COUNT
          }
        ]
      }
    });

    const result = readFileSync(__dirname + '/count.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('FREQ', () => {
    const freqData = [[2], [7], [2], [3], [7], [2], [42]];

    const table = new voici.Table(freqData, {
      ...config,
      calculated: {
        columns: [
          {
            column: 0,
            func: voici.CalculateFunction.FREQ
          }
        ]
      }
    });

    const result = readFileSync(__dirname + '/freq.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('INFREQ', () => {
    const infreqData = [[2], [7], [2], [3], [7], [2], [42]];

    const table = new voici.Table(infreqData, {
      ...config,
      calculated: {
        columns: [
          {
            column: 0,
            func: voici.CalculateFunction.INFREQ
          }
        ]
      }
    });

    const result = readFileSync(__dirname + '/infreq.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MAX', () => {
    const table = new voici.Table(data, {
      ...config,
      calculated: {
        columns: [
          {
            column: 0,
            func: voici.CalculateFunction.MAX
          }
        ]
      }
    });

    const result = readFileSync(__dirname + '/max.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MEAN', () => {
    const table = new voici.Table(data, {
      ...config,
      calculated: {
        columns: [
          {
            column: 0,
            func: voici.CalculateFunction.MEAN
          }
        ]
      }
    });

    const result = readFileSync(__dirname + '/mean.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MEDIAN', () => {
    const table = new voici.Table(data, {
      ...config,
      calculated: {
        columns: [
          {
            column: 0,
            func: voici.CalculateFunction.MEDIAN
          }
        ]
      }
    });

    const result = readFileSync(__dirname + '/median.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MIN', () => {
    const table = new voici.Table(data, {
      ...config,
      calculated: {
        columns: [
          {
            column: 0,
            func: voici.CalculateFunction.MIN
          }
        ]
      }
    });

    const result = readFileSync(__dirname + '/min.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('RANGE', () => {
    const table = new voici.Table(data, {
      ...config,
      calculated: {
        columns: [
          {
            column: 0,
            func: voici.CalculateFunction.RANGE
          }
        ]
      }
    });

    const result = readFileSync(__dirname + '/range.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('STD', () => {
    const table = new voici.Table(data, {
      ...config,
      calculated: {
        columns: [
          {
            column: 0,
            func: voici.CalculateFunction.STD
          }
        ]
      }
    });

    const result = readFileSync(__dirname + '/std.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('SUM', () => {
    const table = new voici.Table(data, {
      ...config,
      calculated: {
        columns: [
          {
            column: 0,
            func: voici.CalculateFunction.SUM
          }
        ]
      }
    });

    const result = readFileSync(__dirname + '/sum.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('VAR', () => {
    const table = new voici.Table(data, {
      ...config,
      calculated: {
        columns: [
          {
            column: 0,
            func: voici.CalculateFunction.VAR
          }
        ]
      }
    });

    const result = readFileSync(__dirname + '/var.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });
});
