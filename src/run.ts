import * as voici from './';
import { join } from 'path';

const data = [
  ['Homer', 'Simpson', 39],
  ['Marge', 'Simpson', 36],
  ['Bart', 'Simpson', 10],
  ['Lisa', 'Simpson', 8],
  ['Maggie', 'Simpson', 1]
];

const table = new voici.Table(data);
table.printPlain();
