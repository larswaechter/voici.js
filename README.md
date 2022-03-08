# voici.js

A Node.js library for displaying table data on the terminal.

![Tests](https://github.com/larswaechter/voici.js/actions/workflows/tests.yaml/badge.svg)
![Linter](https://github.com/larswaechter/voici.js/actions/workflows/linter.yaml/badge.svg)

## Introduction

voici.js (speak: [/vwasi/](https://dictionary.cambridge.org/dictionary/french-english/voici)) is a Node.js library written in TypeScript for beautifully displaying table data on your terminal. The provided dataset must be an array of arrays or an array of objects.

Main features:

- Text styling (alignment, bold, italic, underline, color, precision)
- Column styling (width, padding, background, border, numeration)
- Row styling (background, highlighting)
- Auto computed values (mean, min, sum, variance and more)
- Data import from .json / .csv
- Table output export to .png / .txt
- Sorting

## 💻 Installation

Install via npm:

```bash
npm i --save voici.js
```

## 🔨 Usage

```js
import { Table } from 'voici.js';
```

## 📚 Documentation

You can find the complete documentation including all available methods [here](https://larswaechter.github.io/voici.js/).
Otherwise check out the [tests](https://github.com/larswaechter/voici.js/blob/master/tests/) for a bunch of examples.

## 🧩 Contributing

See [CONTRIBUTING.md](https://github.com/larswaechter/voici.js/blob/master/CONTRIBUTING.md)

## 🔑 License

voici.js is released under [MIT](https://github.com/larswaechter/voici.js/blob/master/LICENSE) license.
