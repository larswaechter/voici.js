import * as voici from './';
import { join } from 'path';

interface Person {
  firstname: string;
  lastname: string;
  age: number;
}

const data = [
  { firstname: 'Homer', lastname: 'Simpson', age: 39 },
  { firstname: 'Marge', lastname: 'Simpson', age: 36 },
  { firstname: 'Bart', lastname: 'Simpson', age: 10 },
  { firstname: 'Lisa', lastname: 'Simpson', age: 8 },
  { firstname: 'Maggie', lastname: 'Simpson', age: 1 }
];

const table = new voici.Table(data, {
  header: {
    width: 'stretch'
  }
});

table.print();
