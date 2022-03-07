import { join } from 'path';
import { ComputeFunction } from './computed';

import { Table } from './table';

interface User {
  ID: number;
  Firstname: string;
  Lastname: string;
  Email: string;
  Gender: string;
}

const data = [
  {
    ID: 45353,
    Firstname: 'Lars',
    Lastname: 'Wächter',
    Email: 'lars97.waechter@gmail.com',
    Gender: 'Male',
    Nums: [0, 1],
    Price: 56535.812341
  },
  {
    ID: 9152,
    Firstname: 'Johanna',
    Lastname: 'Pi',
    Email: 'jo@web.de',
    Gender: 'Female',
    Nums: [1, 2],
    Price: 0.13578
  },
  {
    ID: 102,
    Firstname: 'Tom',
    Lastname: 'Maschmeier',
    Email: 'tommasch@google.com',
    Gender: 'Male',
    Nums: [3, 4],
    Price: 212
  },
  {
    ID: 23,
    Firstname: 'Laurel',
    Lastname: 'Meyer',
    Email: 'laurel112@web.de',
    Gender: 'Female',
    Nums: [5, 6],
    Price: 1.667
  }
];

const data2 = [
  ['Lars', 'Wächter', 'Male'],
  ['Jane', 'Doe', 'Female']
];

type Test = [string, string, string];

const table = new Table(data, {
  align: 'CENTER',
  border: {
    vertical: '|',
    horizontal: '-'
  },
  header: {
    italic: true
  },
  body: {
    striped: true,
    highlightCell: {
      func: (content, row, col) => {
        return content === 212;
      }
    }
  }
});

table.print();
/*
Table.fromCSV(join(__dirname, '../', 'data.csv'), { delimiter: ',', headers: true }, {}).then(
  (table) => {
    table.removeColumn('0');
    table.print();
  }
);
*/

Table.fromJSON(join(__dirname, '../', 'data2.json')).then((table) => {
  table.print();
});
