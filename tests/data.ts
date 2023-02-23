export type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

export interface IDefaultData {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  gender: string;
  birthdate: Date;
}

export const defaultData: Nullable<IDefaultData>[] = [
  {
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    email: 'johndoe@gmail.com',
    gender: 'Male',
    birthdate: new Date(1997, 7, 28)
  },
  {
    id: 45,
    firstname: 'Hermine',
    lastname: 'Granger',
    email: 'hermine@gryffindor.com',
    gender: 'Female',
    birthdate: new Date(1991, 5, 12)
  },
  {
    id: 421,
    firstname: 'Max',
    lastname: 'Mustermann',
    email: 'mamu@stermann.com',
    gender: 'Male',
    birthdate: new Date(2004, 10, 15)
  },
  {
    id: 2003,
    firstname: 'Peter',
    lastname: 'Parker',
    email: 'spidy@dummynet.com',
    gender: 'Male',
    birthdate: new Date(1980, 1, 4)
  },
  {
    id: 892,
    firstname: 'Lois',
    lastname: 'Lane',
    email: 'lanelois@mymail.de',
    gender: 'Female',
    birthdate: new Date(1972, 11, 1)
  },
  {
    id: 55,
    firstname: 'Michael',
    lastname: 'Jackson',
    email: 'michael@jackson.com',
    gender: 'Male',
    birthdate: new Date(1965, 3, 22)
  }
];

export type TArrData = [number, string, string, string, string, Date];

export const arrData: TArrData[] = [
  [1, 'John', 'Doe', 'johndoe@gmail.com', 'Male', new Date(1997, 7, 28)],
  [45, 'Hermine', 'Granger', 'hermine@gryffindor.com', 'Female', new Date(1991, 5, 12)],
  [421, 'Max', 'Mustermann', 'mamu@stermann.com', 'Male', new Date(2004, 10, 15)],
  [2003, 'Peter', 'Parker', 'spiderman@dummynet.com', 'Male', new Date(1980, 1, 4)],
  [892, 'Lois', 'Lane', 'lanelois@mymail.de', 'Female', new Date(1972, 11, 1)],
  [55, 'Michael', 'Jackson', 'michael@j]ackson.com', 'Male', new Date(1965, 3, 22)]
];

export const arrDataNumbers = [
  [2, 14],
  [15, 3],
  [15, 8],
  [3, null],
  [201, 3],
  [null, 92],
  [15, 123],
  [42, 54]
];
