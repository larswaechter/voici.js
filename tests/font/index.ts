import 'mocha';
import assert from 'assert';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';

import { defaultData } from '../data';

describe('Font', () => {
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
});
