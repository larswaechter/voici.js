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

const config: voici.Config = {
  header: {
    numeration: false
  }
};

describe('Simple tables', () => {
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

  it('Array dataset', () => {
    const arrData = [
      [1, 'John', 'Doe', 'johndoe@gmail.com', 'Male'],
      [421, 'Jane', 'Doe', 'doe@yahoo.com', 'Female'],
      [2003, 'Peter', 'Parker', 'spiderman@dummynet.com', 'Male'],
      [55, 'Michael', 'Jackson', 'michael@j]ackson.com', 'Male']
    ];

    const table = new voici.Table(arrData, config);

    const result = readFileSync(__dirname + '/array_dataset.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Border', () => {
    const table = new voici.Table(data, {
      ...config,
      border: {
        horizontal: '=',
        vertical: '|'
      }
    });

    const result = readFileSync(__dirname + '/border.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Dynamic', () => {
    const table = new voici.Table(data, {
      ...config,
      header: {
        dynamic: [
          { name: 'Fullname', func: (row) => row['Firstname'] + ' ' + row['Lastname'] },
          { name: 'Admin', func: (row) => row['ID'] === 1 }
        ]
      }
    });

    const result = readFileSync(__dirname + '/dynamic.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Empty', () => {
    const arrData = [
      [1, 'John', 'Doe', '', 'Male'],
      [421, 'Jane', 'Doe', 'doe@yahoo.com', 'Female'],
      [2003, '', 'Parker', 'spiderman@dummynet.com', 'Male'],
      [55, 'Michael', 'Jackson', 'michael@j]ackson.com', '']
    ];

    const table = new voici.Table(arrData, config);

    const result = readFileSync(__dirname + '/empty.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('MaxWidth align center', () => {
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

  it('Numeration', () => {
    const table = new voici.Table(data, {
      ...config,
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
    const table = new voici.Table(data, {
      ...config,
      order: {
        column: 'ID'
      }
    });

    const result = readFileSync(__dirname + '/order.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Padding', () => {
    const table = new voici.Table(data, {
      ...config,
      padding: {
        size: 4
      }
    });

    const result = readFileSync(__dirname + '/padding.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Precision', () => {
    const arrData = [
      [0.1, 0.435342],
      [5.9651, 3158.23]
    ];

    const table = new voici.Table(arrData, {
      ...config,
      body: {
        precision: 2
      }
    });

    const result = readFileSync(__dirname + '/precision.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Width', () => {
    const arrData = [
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

    const table = new voici.Table(arrData, {
      ...config,
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
