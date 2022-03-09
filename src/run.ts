import * as voici from './';
import { join } from 'path';

const data = [
  { firstname: 'Homer', lastname: 'Simpson', age: 39 },
  { firstname: 'Marge', lastname: 'Simpson', age: 36 },
  { firstname: 'Bart', lastname: 'Simpson', age: 10 },
  { firstname: 'Lisa', lastname: 'Simpson', age: 8 },
  { firstname: 'Maggie', lastname: 'Simpson', age: 1 }
];

const config: voici.Config = {
  header: {
    dynamic: [
      { name: 'Fullname', func: (row) => row['firstname'] + ' ' + row['lastname'] },
      { name: 'Adult', func: (row) => row['age'] >= 18 }
    ]
  }
};

const table = new voici.Table(data, config);
table.printPlain();
