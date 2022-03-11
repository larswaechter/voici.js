import 'mocha';
import assert from 'assert';
import { join } from 'path';
import { readFileSync } from 'fs';

import * as voici from '../../dist/index';

describe('Import', () => {
  it('Import CSV', () => {
    voici
      .fromCSV(join(__dirname, 'import.csv'), {
        headers: true,
        delimiter: ','
      })
      .then((table) => {
        const result = readFileSync(__dirname + '/import.txt', {
          encoding: 'utf-8'
        });

        assert.strictEqual(table.toPlainString(), result);
      });
  });

  it('Import JSON', () => {
    voici.fromJSON(join(__dirname, 'import.json')).then((table) => {
      const result = readFileSync(__dirname + '/import.txt', {
        encoding: 'utf-8'
      });

      assert.strictEqual(table.toPlainString(), result);
    });
  });
});
