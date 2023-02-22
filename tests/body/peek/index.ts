import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../../dist/index';
import { defaultData } from '../../data';

describe('Body Peek', () => {
  it('Peek 1', () => {
    const table = new voici.Table(defaultData, {
      body: {
        peek: 1
      }
    });

    const result = readFileSync(__dirname + '/peek_1.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Peek 2', () => {
    const table = new voici.Table(defaultData, {
      body: {
        peek: 2
      }
    });

    const result = readFileSync(__dirname + '/peek_2.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Peek Max', () => {
    const table = new voici.Table(defaultData, {
      body: {
        peek: Number.MAX_SAFE_INTEGER
      }
    });

    const result = readFileSync(__dirname + '/peek_max.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Peek 2_3', () => {
    const table = new voici.Table(defaultData, {
      body: {
        peek: [2, 3]
      }
    });

    const result = readFileSync(__dirname + '/peek_2_3.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Peek 0_2', () => {
    const table = new voici.Table(defaultData, {
      body: {
        peek: [0, 2]
      }
    });

    const result = readFileSync(__dirname + '/peek_0_2.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Peek 2_0', () => {
    const table = new voici.Table(defaultData, {
      body: {
        peek: [2, 0]
      }
    });

    const result = readFileSync(__dirname + '/peek_2_0.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Peek Max_Max', () => {
    const table = new voici.Table(defaultData, {
      body: {
        peek: [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
      }
    });

    const result = readFileSync(__dirname + '/peek_max_max.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Peek Border', () => {
    const table = new voici.Table(defaultData, {
      border: {
        horizontal: '-',
        vertical: '|'
      },
      body: {
        peek: 2
      }
    });

    const result = readFileSync(__dirname + '/peek_border.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });
});
