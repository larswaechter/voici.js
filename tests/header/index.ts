import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';

import { defaultData } from '../data';

describe('Header', () => {
  it('Columns', () => {
    const table = new voici.Table(defaultData, {
      header: {
        columns: ['id', 'lastname', 'gender']
      }
    });

    const result = readFileSync(__dirname + '/columns.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Columns Numeration', () => {
    const table = new voici.Table(defaultData, {
      header: {
        columns: ['id', 'lastname', 'gender'],
        numeration: true
      }
    });

    const result = readFileSync(__dirname + '/columns_numeration.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Dynamic', () => {
    const table = new voici.Table(defaultData, {
      header: {
        dynamic: [
          { name: 'fullname', func: (row) => row['firstname'] + ' ' + row['lastname'] },
          { name: 'admin', func: (row) => row['id'] === 1 }
        ]
      }
    });

    const result = readFileSync(__dirname + '/dynamic.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Lowercase', () => {
    const table = new voici.Table(defaultData, {
      header: {
        lowercase: true
      }
    });

    const result = readFileSync(__dirname + '/lowercase.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Names', () => {
    const table = new voici.Table(defaultData, {
      header: {
        names: {
          firstname: 'fName',
          lastname: 'lName',
          birthdate: 'bdate'
        }
      }
    });

    const result = readFileSync(__dirname + '/names.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Numeration', () => {
    const table = new voici.Table(defaultData, {
      header: {
        numeration: true
      }
    });

    const result = readFileSync(__dirname + '/numeration.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Order', () => {
    const table = new voici.Table(defaultData, {
      header: {
        order: ['email', 'gender', 'firstname']
      }
    });

    const result = readFileSync(__dirname + '/order.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Separator', () => {
    const table = new voici.Table(defaultData, {
      header: {
        separator: '-'
      }
    });

    const result = readFileSync(__dirname + '/separator.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Uppercase', () => {
    const table = new voici.Table(defaultData, {
      header: {
        uppercase: true
      }
    });

    const result = readFileSync(__dirname + '/uppercase.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Upperfirst', () => {
    const table = new voici.Table(defaultData, {
      header: {
        upperfirst: true
      }
    });

    const result = readFileSync(__dirname + '/upperfirst.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Width', () => {
    const data = [
      ['abcdefghijklmn', 'opqrstuv wxyz abcdefghijklmnopq', 'rstuv wx y z abcd ef ghi jklmnop'],
      [
        'abc def gh ijklm nopqrstuv wxyzabcd efg h',
        'ijklmno pqr stuvw xy',
        'abcd efgh iklmn op qr stuvq xyz'
      ],
      ['ab cd ef gh', 'ij kl mn op', 'qrstuvw xyzabc defgh'],
      [
        'abcdefghijklmnopqrstuv wxyz abcdefghijklmn opqr stuvw',
        'abc defg hijkl mnopqr stuv wxyz abc defgh ijkl mn opqr st uvw xyzabcdefghijklmn',
        'abc def ghi jk lmnop'
      ]
    ];

    const table = new voici.Table(data, {
      header: {
        width: 20
      }
    });

    const result = readFileSync(__dirname + '/width.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });
});
