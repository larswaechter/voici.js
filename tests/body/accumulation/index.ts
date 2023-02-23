import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../../dist/index';

import { arrDataNumbers } from '../../data';

describe('Body Accumulation', () => {
  it('COUNT', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: {
            0: voici.AccumulationFunction.COUNT
          }
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
          columns: {
            0: voici.AccumulationFunction.FREQ
          }
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
          columns: {
            0: voici.AccumulationFunction.GEO_MEAN
          }
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
          columns: {
            0: voici.AccumulationFunction.HARM_MEAN
          }
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
          columns: {
            0: voici.AccumulationFunction.INFREQ
          }
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
          columns: {
            0: voici.AccumulationFunction.MAX
          }
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
          columns: {
            0: voici.AccumulationFunction.MEAN
          }
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
          columns: {
            0: voici.AccumulationFunction.MEDIAN
          }
        }
      }
    });

    const result = readFileSync(__dirname + '/median.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MEDIAN odd', () => {
    const data = [[2], [4], [1], [3], [5]];

    const table = new voici.Table(data, {
      body: {
        accumulation: {
          separator: '=',
          columns: {
            0: voici.AccumulationFunction.MEDIAN
          }
        }
      }
    });

    const result = readFileSync(__dirname + '/median_odd.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MIN', () => {
    const table = new voici.Table(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',
          columns: {
            0: voici.AccumulationFunction.MIN
          }
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
          columns: {
            0: voici.AccumulationFunction.MAX,
            1: voici.AccumulationFunction.MIN
          }
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
          columns: {
            0: voici.AccumulationFunction.RANGE
          }
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
          columns: {
            0: voici.AccumulationFunction.STD
          }
        }
      }
    });

    const result = readFileSync(__dirname + '/std.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('SUM dynamic', () => {
    interface ITest {
      Double: number;
    }

    const table = new voici.Table<(typeof arrDataNumbers)[number], ITest>(arrDataNumbers, {
      body: {
        accumulation: {
          separator: '=',

          columns: {
            0: voici.AccumulationFunction.SUM,
            Double: voici.AccumulationFunction.SUM
          }
        }
      },
      header: {
        dynamic: {
          Double: (row) => (row[0] == null ? 0 : row[0]) * 2
        }
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
          columns: {
            0: voici.AccumulationFunction.SUM
          }
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
          columns: {
            0: voici.AccumulationFunction.VAR
          }
        }
      }
    });

    const result = readFileSync(__dirname + '/var.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });
});
