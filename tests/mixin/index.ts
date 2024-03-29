import 'mocha';
import assert from 'assert';
import _cloneDeep from 'lodash/cloneDeep';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';

import { defaultData, arrData } from '../data';

describe('Mixin', () => {
  it('Stringify', () => {
    assert.strictEqual(voici.stringify('abc'), 'abc');
    assert.strictEqual(voici.stringify('123'), '123');
    assert.strictEqual(voici.stringify(new Date(2020, 7, 31)), 'Mon Aug 31 2020');
    assert.strictEqual(voici.stringify({ k1: 'a', k2: 'b' }), '{"k1":"a","k2":"b"}');
    assert.strictEqual(voici.stringify(['abc', '123']), '["abc","123"]');
    assert.strictEqual(voici.stringify(new Set(['abc', '123'])), '["abc","123"]');
    assert.strictEqual(
      voici.stringify(
        new Map([
          ['key1', 'abc'],
          ['key2', '123']
        ])
      ),
      '[["key1","abc"],["key2","123"]]'
    );
    assert.strictEqual(voici.stringify(NaN), '');
    assert.strictEqual(voici.stringify(undefined), '');
    assert.strictEqual(voici.stringify(null), '');
  });

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

  it('Columns', () => {
    interface IDynamic {
      fullname: string;
    }

    const table = new voici.Table<(typeof defaultData)[number], IDynamic>(defaultData, {
      header: {
        dynamic: {
          fullname: (row) => row.firstname + ' ' + row.lastname
        }
      }
    });

    assert.deepEqual(table.columns, [
      'id',
      'firstname',
      'lastname',
      'email',
      'gender',
      'birthdate',
      'fullname'
    ]);

    const table2 = new voici.Table(arrData);

    assert.deepEqual(table2.columns, ['0', '1', '2', '3', '4', '5']);
  });

  it('Default', () => {
    const table = new voici.Table(defaultData);

    const result = readFileSync(__dirname + '/default.txt', {
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

  it('Shape', () => {
    interface IDynamic {
      fullname: string;
    }

    const table = new voici.Table<(typeof defaultData)[number], IDynamic>(defaultData, {
      header: {
        dynamic: {
          fullname: (row) => row.firstname + ' ' + row.lastname
        }
      }
    });

    assert.deepEqual(table.shape, [6, 7]);
  });

  it('Sort', () => {
    const table = new voici.Table(defaultData, {
      sort: {
        columns: ['gender', 'id'],
        directions: ['asc', 'desc']
      }
    });

    const result = readFileSync(__dirname + '/sort.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Sort Exception', () => {
    assert.throws(() => {
      new voici.Table(defaultData, {
        sort: {
          columns: ['gender', 'id'],
          directions: ['asc']
        }
      });
    });
  });
});
