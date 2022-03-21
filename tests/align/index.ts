import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';

const data = [
  {
    ID: 1,
    Firstname: 'John',
    Lastname: 'Doe',
    Email: 'johndoe@gmail.com',
    Gender: 'Male'
  },
  {
    ID: 421,
    Firstname: 'Jane',
    Lastname: 'Doe',
    Email: 'doe@yahoo.com',
    Gender: 'Female'
  },
  {
    ID: 2003,
    Firstname: 'Peter',
    Lastname: 'Parker',
    Email: 'spiderman@dummynet.com',
    Gender: 'Male'
  },
  {
    ID: 55,
    Firstname: 'Michael',
    Lastname: 'Jackson',
    Email: 'michael@jackson.com',
    Gender: 'Male'
  }
];

const arrData = [
  ['abcdefghijklmn', 'opqrstuv wxyz abcdefghijklmnopq', 'rstuv wx y z abcd ef ghi jklmnop'],
  ['abc def gh ', 'ijklmno pqr stuvw xy', 'abcd efgh iklmn op qr stuvq xyz'],
  ['ab cd ef gh', 'ij kl mn op', 'qrstuvw xyzabc defgh'],
  [
    'abcdef ghi',
    'abc defg hijkl mnopqr stuv wxyz abc defgh ijkl mn opqr st uvw xyzabcdefghijklmn',
    'abc def ghi jk lmnop'
  ]
];

const config: voici.Config = {
  header: {
    numeration: false
  }
};

describe('Align', () => {
  it('Align center', () => {
    const table = new voici.Table(data, {
      align: 'CENTER',
      ...config
    });

    const result = readFileSync(__dirname + '/align_center.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Align left', () => {
    const table = new voici.Table(data, config);

    const result = readFileSync(__dirname + '/align_left.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Align right', () => {
    const table = new voici.Table(data, {
      align: 'RIGHT',
      ...config
    });

    const result = readFileSync(__dirname + '/align_right.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MaxWidth align center', () => {
    const table = new voici.Table(arrData, {
      ...config,
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
      ...config,
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
      ...config,
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
