import * as voici from './';
import { join } from 'path';

console.log('');
console.log('');

const data = [
  { firstname: 'Homer', lastname: 'Simpson', age: 39 },
  { firstname: 'Marge', lastname: 'Simpson', age: 36 },
  { firstname: 'Bart', lastname: 'Simpson', age: 10 },
  { firstname: 'Lisa', lastname: 'Simpson', age: 8 },
  { firstname: 'Maggie', lastname: 'Simpson', age: 1 }
];

const config = {
  align: 'CENTER',
  body: {
    bgColor: '#E88873',
    textColor: '#b4eeb4'
  },
  border: {
    horizontal: '-',
    vertical: '|'
  },
  header: {
    upperFirst: true
  },
  padding: {
    char: ' ',
    size: 4
  }
};

const table = new voici.Table(data);
table.print();

console.log('');
console.log('');
