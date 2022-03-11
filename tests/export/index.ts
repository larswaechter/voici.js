import 'mocha';
import assert from 'assert';
import { readFileSync, unlinkSync, existsSync } from 'fs';

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

describe('Export', () => {
  it('Export TXT', () => {
    const table = new voici.Table(data);
    const filename = __dirname + '/tmp.txt';

    if (existsSync(filename)) unlinkSync(filename);

    table.exportFile(filename);

    const result = readFileSync(__dirname + '/export.txt', {
      encoding: 'utf-8'
    });

    if (existsSync(filename)) unlinkSync(filename);
    assert.strictEqual(table.toPlainString(), result);
  });
});
