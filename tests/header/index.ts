import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';

import { arrData, defaultData } from '../data';

describe('Header', () => {
  it('Include', () => {
    const table = new voici.Table(defaultData, {
      header: {
        include: ['id', 'lastname', 'gender']
      }
    });

    const result = readFileSync(__dirname + '/include_exclude.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Exclude', () => {
    const table = new voici.Table(defaultData, {
      header: {
        exclude: ['firstname', 'email', 'birthdate']
      }
    });

    const result = readFileSync(__dirname + '/include_exclude.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Include Array', () => {
    const table = new voici.Table(arrData, {
      header: {
        include: [0, 2, 4]
      }
    });

    const result = readFileSync(__dirname + '/include_exclude_array.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Exclude Array', () => {
    const table = new voici.Table(arrData, {
      header: {
        exclude: [1, 3, 5]
      }
    });

    const result = readFileSync(__dirname + '/include_exclude_array.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Include Origin', () => {
    const table = new voici.Table(defaultData, {
      header: {
        include: ['id', 'lastname', 'gender'],
        origin: true
      }
    });

    const result = readFileSync(__dirname + '/include_exclude_origin.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Exclude Origin', () => {
    const table = new voici.Table(defaultData, {
      header: {
        exclude: ['firstname', 'email', 'birthdate'],
        origin: true
      }
    });

    const result = readFileSync(__dirname + '/include_exclude_origin.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Dynamic', () => {
    interface IDynamicAttributes {
      fullname: string;
      admin: boolean;
    }

    const table = new voici.Table<(typeof defaultData)[number], IDynamicAttributes>(defaultData, {
      header: {
        dynamic: {
          fullname: (row) => row['firstname'] + ' ' + row['lastname'],
          admin(row) {
            return row['id'] === 1;
          }
        }
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
        displayNames: {
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

  it('Origin', () => {
    const table = new voici.Table(defaultData, {
      header: {
        origin: true
      }
    });

    const result = readFileSync(__dirname + '/origin.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Array Order', () => {
    const table = new voici.Table(arrData, {
      header: {
        order: [3, 4, 1]
      }
    });

    const result = readFileSync(__dirname + '/order_array.txt', {
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

  it('MaxWidth', () => {
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
        maxWidth: 15
      }
    });

    const result = readFileSync(__dirname + '/max_width.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });
});
