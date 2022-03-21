import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';

const data = [
  {
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    email: 'johndoe@gmail.com',
    gender: 'Male'
  },
  {
    id: 421,
    firstname: 'Jane',
    lastname: 'Doe',
    email: 'doe@yahoo.com',
    gender: 'Female'
  },
  {
    id: 2003,
    firstname: 'Peter',
    lastname: 'Parker',
    email: 'spiderman@dummynet.com',
    gender: 'Male'
  },
  {
    id: 55,
    firstname: 'Michael',
    lastname: 'Jackson',
    email: 'michael@jackson.com',
    gender: 'Male'
  }
];

const config: voici.Config = {
  header: {
    numeration: false
  }
};

describe('Font', () => {
  it('Uppercase', () => {
    const table = new voici.Table(data, {
      ...config,
      header: {
        uppercase: true
      }
    });

    const result = readFileSync(__dirname + '/uppercase.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Lowercase', () => {
    const table = new voici.Table(data, {
      ...config,
      header: {
        lowercase: true
      }
    });

    const result = readFileSync(__dirname + '/lowercase.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });

  it('Upperfirst', () => {
    const table = new voici.Table(data, {
      ...config,
      header: {
        upperfirst: true
      }
    });

    const result = readFileSync(__dirname + '/upperfirst.txt', {
      encoding: 'utf-8'
    });

    assert.strictEqual(table.toPlainString(), result);
  });
});
