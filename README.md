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
- Table export to .png / .txt
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

You can find the complete TypeDoc documentation including the complete API [here](https://larswaechter.github.io/voici.js/). Otherwise check out the [tests](https://github.com/larswaechter/voici.js/blob/master/tests/) for some examples.

The top level configuration of voici.js:

```js
const config = {
  align: 'LEFT',
  body: {},
  border: {},
  computed: {},
  header: {},
  order: {},
  padding: {}
};
```

### align

|  Name   |   Type   | Default |     Description     |
| :-----: | :------: | :-----: | :-----------------: |
| `align` | `string` | `LEFT`  | The text alignment. |

### bgColorColumns

|       Name       |    Type    | Default |              Description              |
| :--------------: | :--------: | :-----: | :-----------------------------------: |
| `bgColorColumns` | `string[]` |  `[]`   | The background color for each column. |

### body

```js
const body = {
  bgColor: '',
  highlightCell: {},
  highlightRow: {},
  precision: 3,
  striped: true,
  textColor: ''
};
```

#### bgColor

|    Name     |   Type    | Default |                 Description                  |
| :---------: | :-------: | :-----: | :------------------------------------------: |
|  `bgColor`  | `string`  |  `''`   |      The background color of the body.       |
| `precision` | `number`  |   `3`   |   The floating point precision of numbers.   |
|  `striped`  | `boolean` | `true`  | Whether the row background should be striped |
| `textColor` | `string`  |  `''`   |         The text color of the rows.          |

#### highlightCell

|    Name     |                              Type                               | Default |                      Description                       |
| :---------: | :-------------------------------------------------------------: | :-----: | :----------------------------------------------------: |
| `textColor` |                            `string`                             |  `''`   |        The text color of the highlighted cell.         |
|   `func`    | `(content: any, row: number, col: string \| number) => boolean` | `null`  | The callback to determine whether to highlight or not. |

#### highlightRow

|   Name    |                  Type                  | Default |                      Description                       |
| :-------: | :------------------------------------: | :-----: | :----------------------------------------------------: |
|  `func`   | `(row: any, index: number) => boolean` | `null`  | The callback to determine whether to highlight or not. |
| `bgColor` |                `string`                |  `''`   |      The background color of the highlighted row.      |

### border

```js
const border = {
  color: '',
  horizontal: '',
  vertical: ''
};
```

|     Name     |   Type   | Default |           Description            |
| :----------: | :------: | :-----: | :------------------------------: |
|   `color`    | `string` |  `''`   |        The border color.         |
| `horizontal` | `string` |  `''`   | The horizontal border character. |
|  `vertical`  | `string` |  `''`   |  The vertical border character.  |

### computed

```js
const computed = {
  bgColor: '',
  columns: []
};
```

|   Name    |   Type   | Default |                Description                |
| :-------: | :------: | :-----: | :---------------------------------------: |
| `bgColor` | `string` |  `''`   | The background color of the computed row. |

#### columns

|   Name    |       Type       | Default |                 Description                 |
| :-------: | :--------------: | :-----: | :-----------------------------------------: |
| `columns` | `ComputedCell[]` |  `[]`   | The configuration for each computed column. |

## 🧩 Contributing

See [CONTRIBUTING.md](https://github.com/larswaechter/voici.js/blob/master/CONTRIBUTING.md)

## 🔑 License

voici.js is released under [MIT](https://github.com/larswaechter/voici.js/blob/master/LICENSE) license.
