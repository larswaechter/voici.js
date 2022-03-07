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
  },
  padding: {
    char: '.'
  }
};

describe('Simple table', () => {
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

  it('Numeration', () => {
    const table = new voici.Table(data, {
      ...config,
      header: {
        underline: false,
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
        key: 'ID'
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
        size: 4,
        char: '-'
      }
    });

    const result = readFileSync(__dirname + '/padding.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });
});
