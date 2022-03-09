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

interface MyType1 {
  firstname: string;
  lastname: string;
}

const data1: MyType1[] = [
  { firstname: 'John', lastname: 'Doe' },
  { firstname: 'Jane', lastname: 'Doe' }
];

type MyType2 = [string, string];

const data2: MyType2[] = [
  ['hello', 'world'],
  ['goodbye', 'world']
];

const table = new Table<MyType1>(data1, {
  header: {
    width: 15
  },
  body: {
    highlightRow: {
      func: <MyType1>(row) => {
        console.log(row);

        return row.firstname === 'John';
      }
    }
  }
});

table.print();
table.exportImage(join(__dirname, '../', 'img.png'));
