import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';

import { defaultData } from '../data';

const arrData = [
  ['abcdefghijklmn', 'opqrstuv wxyz abcdefghijklmnopq', 'rstuv wx y z abcd ef ghi jklmnop'],
  ['abc def gh', 'ijklmno pqr stuvw xy', 'abcd efgh iklmn op qr stuvq xyz'],
  ['ab cd ef gh', 'ij kl mn op', 'qrstuvw xyzabc defgh'],
  [
    'abcdef ghi',
    'abc defg hijkl mnopqr stuv wxyz abc defgh ijkl mn opqr st uvw xyzabcdefghijklmn',
    'abc def ghi jk lmnop'
  ]
];

describe('Align', () => {
  it('Align center', () => {
    const table = new voici.Table(defaultData, {
      align: 'CENTER'
    });

    const result = readFileSync(__dirname + '/align_center.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Align left', () => {
    const table = new voici.Table(defaultData, {
      align: 'LEFT'
    });

    const result = readFileSync(__dirname + '/align_left.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Align right', () => {
    const table = new voici.Table(defaultData, {
      align: 'RIGHT'
    });

    const result = readFileSync(__dirname + '/align_right.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MaxWidth align center', () => {
    const table = new voici.Table(arrData, {
      align: 'CENTER',
      header: {
        maxWidth: 30
      }
    });

    const result = readFileSync(__dirname + '/max_width_center.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MaxWidth align left', () => {
    const table = new voici.Table(arrData, {
      align: 'LEFT',
      header: {
        maxWidth: 30
      }
    });

    const result = readFileSync(__dirname + '/max_width_left.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MaxWidth align right', () => {
    const table = new voici.Table(arrData, {
      align: 'RIGHT',
      header: {
        maxWidth: 30
      }
    });

    const result = readFileSync(__dirname + '/max_width_right.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });
});
