# voici.js

A Node.js library for pretty printing your data on the terminal🎨

[![npm version](https://img.shields.io/npm/v/voici.js.svg?style=flat)](https://www.npmjs.com/package/voici.js)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/larswaechter/voici.js/blob/main/LICENSE)
[![Documentation](https://img.shields.io/badge/GitBook-Docu-lightblue)](https://lars-waechter.gitbook.io/voici.js/)
![Tests](https://github.com/larswaechter/voici.js/actions/workflows/tests.yaml/badge.svg)
![Linter](https://github.com/larswaechter/voici.js/actions/workflows/linter.yaml/badge.svg)

![](./preview.png)

## 📍 Introduction

voici.js (speak: [/vwasi/](https://dictionary.cambridge.org/dictionary/french-english/voici)) is an open source Node.js library written in TypeScript for beautifully displaying datasets in tabular form on the terminal including features like:

- Text / Column / Row styling
- Column sizing
- Accumulation
- Dynamic columns
- Data import from .json / .csv
- Table export to .png / .txt
- Sorting

Check out the [website](https://lars-waechter.gitbook.io/voici.js/).

## 💻 Installation

Install via npm:

```bash
npm i --save voici.js
```

## 🔨 Usage

```js
import { Table } from 'voici.js';

const data = [
  { firstname: 'Homer', lastname: 'Simpson', age: 39 },
  { firstname: 'Marge', lastname: 'Simpson', age: 36 },
  { firstname: 'Bart', lastname: 'Simpson', age: 10 },
  { firstname: 'Lisa', lastname: 'Simpson', age: 8 },
  { firstname: 'Maggie', lastname: 'Simpson', age: 1 }
];

const table = new Table(data);
table.print();
```

The console output:

```
  firstname    lastname    age
================================
  Homer        Simpson     39
  Marge        Simpson     36
  Bart         Simpson     10
  Lisa         Simpson     8
  Maggie       Simpson     1
```

You can find many more examples [here](https://lars-waechter.gitbook.io/voici.js/examples).

## 📚 Documentation

The following documentations are available:

- [GitBook](https://github.com/larswaechter/voici.js)
- [TypeDoc](https://larswaechter.github.io/voici.js/)

Otherwise check out the [tests](https://github.com/larswaechter/voici.js/blob/master/tests/) for more examples.

## 🧩 Contributing

See [CONTRIBUTING.md](https://github.com/larswaechter/voici.js/blob/master/CONTRIBUTING.md)

## 🔑 License

voici.js is released under [MIT](https://github.com/larswaechter/voici.js/blob/master/LICENSE) license.
