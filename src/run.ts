import { Table } from './';

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

table.print();
