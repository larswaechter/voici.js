/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';

import { arrData, defaultData, TArrData } from '../data';

describe('Integration', () => {
  it('Integration 1', () => {
    interface IDynamicAttributes {
      id2: number;
    }

    const table = new voici.Table<TArrData, IDynamicAttributes>(arrData, {
      header: {
        order: [2, 1, 0, 4, 3, 5, 'id2', '#'],
        origin: true,
        displayNames: {
          3: 'three'
        },
        dynamic: {
          id2(row) {
            return row[0] * 2;
          }
        }
      },
      sort: {
        columns: ['#'],
        directions: ['desc']
      }
    });

    const result = readFileSync(__dirname + '/integration_1.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
    assert.strictEqual(table.getDataCell(2, '#'), 3);
    assert.strictEqual(table.getDataCell(2, 'id2'), 4006);
    assert.strictEqual(table.getDataCell(4, 2), 'Granger');
  });

  it('Integration 2', () => {
    interface IDynamicAttributes {
      id2: number;
    }

    const table = new voici.Table<(typeof defaultData)[number], IDynamicAttributes>(defaultData, {
      header: {
        order: ['lastname', 'firstname', 'id', 'gender', 'email', 'birthdate', 'id2', '#'],
        origin: true,
        displayNames: {
          email: 'mail'
        },
        dynamic: {
          id2(row) {
            return row.id! * 2;
          }
        }
      },
      sort: {
        columns: ['id2'],
        directions: ['desc']
      }
    });

    const result = readFileSync(__dirname + '/integration_2.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
    assert.strictEqual(table.getDataCell(1, '#'), 4);
    assert.strictEqual(table.getDataCell(2, 'id2'), 842);
    assert.strictEqual(table.getDataCell(5, 'lastname'), 'Doe');
  });
});
