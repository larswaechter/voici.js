import 'mocha';
import assert from 'assert';
import _cloneDeep from 'lodash/cloneDeep';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';

import { defaultData, arrData } from '../data';

describe('Mixin', () => {
  it('Array dataset', () => {
    const table = new voici.Table(arrData);

    const result = readFileSync(__dirname + '/array_dataset.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Border', () => {
    const table = new voici.Table(defaultData, {
      border: {
        groupSize: 2,
        horizontal: '=',
        vertical: '|'
      }
    });

    const result = readFileSync(__dirname + '/border.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Empty', () => {
    const data = _cloneDeep(defaultData);
    data[0].firstname = '';
    data[1].lastname = '';
    data[2].email = '';
    data[3].gender = '';
    data[4].birthdate = null;

    const table = new voici.Table(data);

    const result = readFileSync(__dirname + '/empty.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Order', () => {
    const table = new voici.Table(defaultData, {
      order: {
        columns: ['gender', 'id'],
        directions: ['asc', 'desc']
      }
    } as voici.Config);

    const result = readFileSync(__dirname + '/order.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Padding', () => {
    const table = new voici.Table(defaultData, {
      padding: {
        size: 4
      }
    });

    const result = readFileSync(__dirname + '/padding.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Unknown column', () => {
    assert.throws(
      () =>
        new voici.Table(defaultData, {
          header: {
            columns: ['Missing']
          }
        }),
      Error
    );
  });

  it('Reference datatypes', () => {
    const data = [
      [
        ['this', 'is', 'an', 'array'],
        { prop1: 'this', prop2: 'is', prop3: 'a', prop4: 'object' },
        new Set(['this', 'is', 'a', 'set']),
        new Map([
          [1, 'this'],
          [2, 'is'],
          [3, 'a'],
          [4, 'map']
        ])
      ],
      [
        ['this', 'is', 'another', 'array'],
        { prop1: 'this', prop2: 'is', prop3: 'another', prop4: 'object' },
        new Set(['this', 'is', 'aanother', 'set']),
        new Map([
          [1, 'this'],
          [2, 'is'],
          [3, 'another'],
          [4, 'map']
        ])
      ]
    ];

    const table = new voici.Table(data);

    const result = readFileSync(__dirname + '/reference_datatypes.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });
});
