import 'mocha';
import assert from 'assert';
import { readFileSync, unlinkSync, existsSync } from 'fs';

import * as voici from '../../dist/index';

import { defaultData } from '../data';

describe('Table', () => {
  it('Export TXT', () => {
    const table = new voici.Table(defaultData);
    const filename = __dirname + '/tmp.txt';

    if (existsSync(filename)) unlinkSync(filename);

    table.exportFile(filename);

    const result = readFileSync(__dirname + '/export.txt', {
      encoding: 'utf-8'
    });

    if (existsSync(filename)) unlinkSync(filename);
    assert.strictEqual(table.toPlainString(), result);
  });

  it('Get data cell', () => {
    const table = new voici.Table(defaultData);
    const cell = table.getDataCell(3, 'email');

    assert.strictEqual(cell, 'spidy@dummynet.com');
  });

  it('Remove Row', () => {
    const table = new voici.Table(defaultData);
    table.removeRow(2);

    const result = readFileSync(__dirname + '/remove_row.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });
});
