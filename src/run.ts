import { Config, Table } from './';

interface IData {
  firstname: string;
  lastname: string;
  age: string;
}

/*
const data: IData[] = [
  { firstname: 'Homer', lastname: 'Simpson', age: '39' },
  { firstname: 'Marge', lastname: 'Simpson', age: '36' },
  { firstname: 'Bart', lastname: 'Simpson', age: '10' },
  { firstname: 'Lisa', lastname: 'Simpson', age: '8 ' },
  { firstname: 'Maggie', lastname: 'Simpson', age: '1 ' }
];

const table = new Table<(typeof data)[number], 'fullname'>(data, {
  header: {
    dynamic: [
      {
        name: 'fullname',
        func: (row) => row.firstname + ' ' + row.lastname
      }
    ]
  },
  sort: {
    columns: ['firstname'],
    directions: ['asc']
  }
});
*/

const data = [
  [1, 'John', 'Doe', 'johndoe@gmail.com', 'Male', new Date(1997, 7, 28)],
  [45, 'Hermine', 'Granger', 'hermine@gryffindor.com', 'Female', new Date(1991, 5, 12)],
  [421, 'Max', 'Mustermann', 'mamu@stermann.com', 'Male', new Date(2004, 10, 15)],
  [2003, 'Peter', 'Parker', 'spiderman@dummynet.com', 'Male', new Date(1980, 1, 4)],
  [892, 'Lois', 'Lane', 'lanelois@mymail.de', 'Female', new Date(1972, 11, 1)],
  [55, 'Michael', 'Jackson', 'michael@j]ackson.com', 'Male', new Date(1965, 3, 22)]
];

const table = new Table<(typeof data)[number]>(data, {
  body: {
    subset: [2, 4]
  }
});
table.print();
