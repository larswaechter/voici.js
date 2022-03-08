import { Table } from './';
import { join } from 'path';

const data = [
  [
    'abcdefghijklmnopqrstuvwxyzabcdefghijklmn',
    'wadwadadwwdwadwadadwwdwadwadadwwdwadwadadwwdwadwadadwwdwadwadadwwdwadwadadwwdwadwadadwwd'
  ],
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmn', 'dwadkowada dai lw ijfs'],
  [
    'abcdefghijklmnopqrstuvwxyzabcdefghijklmn',
    'wadwadadwwdwadwadadwwdwadwadadwwdwadwadadwwdwadwadadwwdwadwadadwwdwadwadadwwdwadwadadwwd'
  ]
];

const table = new Table(data, {
  header: {
    width: 15
  }
});

console.log(table.toPlainString());

table.writeImage(join(__dirname, '../', 'img.png'));
