import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../../dist/index';

import { arrDataNumbers } from '../../data';

describe('Accumulation', () => {
  it('COUNT', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.COUNT
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/count.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('FREQ', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.FREQ
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/freq.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('GEO_MEAN', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.GEO_MEAN
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/geo_mean.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('HARM_MEAN', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.HARM_MEAN
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/harm_mean.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('INFREQ', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.INFREQ
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/infreq.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MAX', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.MAX
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/max.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MEAN', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.MEAN
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/mean.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MEDIAN', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.MEDIAN
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/median.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MIN', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.MIN
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/min.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MULTIPLE', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.MAX
            },
            {
              column: 1,
              func: voici.AccumulationFunction.MIN
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/multiple.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('RANGE', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.RANGE
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/range.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('STD', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.STD
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/std.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('SUM dynamic', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.SUM
            },
            {
              column: 'Double',
              func: voici.AccumulationFunction.SUM
            }
          ]
        }
      },
      header: {
        dynamic: [{ name: 'Double', func: (row) => row[0] * 2 }]
      }
    });

    const result = readFileSync(__dirname + '/sum_dynamic.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('SUM', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.SUM
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/sum.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('VAR', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: [
            {
              column: 0,
              func: voici.AccumulationFunction.VAR
            }
          ]
        }
      }
    });

    const result = readFileSync(__dirname + '/var.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });
});
