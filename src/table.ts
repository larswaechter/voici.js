import _ from 'lodash';
import * as csv from 'fast-csv';
import * as jstream from 'JSONStream';
import text2png from 'text2png';
import chalk, { Chalk } from 'chalk';
import { resolve as resolvePath } from 'path';
import { createReadStream, openSync, writeFileSync, OpenMode } from 'fs';

import { getComputed } from './computed';
import { Config, getDefaultConfig, getPlainConfig, Order } from './config';

type ColumnWidths = {
  [key: string]: number;
};

export type Row =
  | {
      [key: string]: unknown;
    }
  | unknown[];

/** leftPadding, text, rightPadding */
type CellContent = [string, string, string];

export class Table<T = Row> {
  private _data: T[];
  private _config: Required<Config>;

  private _computed: Partial<T>;

  private _columnNames: string[] = [];

  /**
   * Max. column text widths
   */
  private columnWidths: ColumnWidths;

  private tableWidth: number;

  private touched: boolean = true;

  /**
   * Create a new `Table` instance from .csv file stream.
   *
   * @param path the .csv filepath
   * @param csvConfig the fast-csv config
   * @param tableConfig the table config
   * @returns a new `Table` instance
   */
  static fromCSV(
    path: string,
    csvConfig: csv.ParserOptionsArgs,
    tableConfig: Config = {}
  ): Promise<Table> {
    return new Promise((resolve, reject) => {
      const data: Row[] = [];
      createReadStream(resolvePath(path))
        .pipe(csv.parse(csvConfig))
        .on('error', (err) => {
          reject(err);
        })
        .on('data', (row) => {
          data.push(row);
        })
        .on('end', () => {
          resolve(new Table(data, tableConfig));
        });
    });
  }

  /**
   * Create a new `Table` instance from .json file stream.
   *
   * @param path the .json filepath
   * @param tableConfig the table config
   * @returns a new `Table` instance
   */
  static fromJSON(path: string, tableConfig: Config = {}): Promise<Table> {
    return new Promise((resolve, reject) => {
      const data: Row[] = [];
      createReadStream(resolvePath(path))
        .pipe(jstream.parse('*'))
        .on('error', (err: Error) => {
          reject(err);
        })
        .on('data', (row: Row) => {
          data.push(row);
        })
        .on('end', () => {
          resolve(new Table(data, tableConfig));
        });
    });
  }

  constructor(data: T[], config: Config = {}) {
    this._data = data.slice();
    this._config = getDefaultConfig(config);
    this.buildHeaderNames();
  }

  public get data() {
    return this._data;
  }

  private set data(data: T[]) {
    this._data = data;
    this.touched = true;
  }

  public get config() {
    return this._config;
  }

  public get columnNames() {
    return this._columnNames;
  }

  private set columnNames(names: string[]) {
    this._columnNames = names;
  }

  public get computed() {
    this.build();
    return this._computed;
  }

  /**
   * Get the value of the given cell.
   *
   * @param row the cell's row
   * @param col the cell's col
   * @returns the cell value
   */
  public getDataCell(row: number, col: string | number) {
    const { header } = this.config;

    if (header.numeration && col === '#') return row;
    return this.data[row][col];
  }

  /**
   * Append the given row to the dataset.
   *
   * @param row the row to append
   */
  appendRow(row: T) {
    this.data.push(row);
  }

  /**
   * Remove the given column from the dataset.
   *
   * @param col the column to remove
   */
  removeColumn(col: string | number) {
    if (this.data.length) {
      const data = [];
      if (Array.isArray(this.data[0])) {
        for (const row of this.data) {
          if (Array.isArray(row)) {
            const copy = [...row];
            copy.splice(col as number, 1);
            data.push(copy);
          }
        }
        this.buildHeaderNames();
      } else {
        const colName = _.isNumber(col) ? this.columnNames[col] : col;
        for (const row of this.data) {
          const copy = { ...row };
          delete copy[colName];
          data.push(copy);
        }
        this.data = data;
        this.columnNames = this.columnNames.filter((name) => name !== colName);
      }
    }
  }

  /**
   * Remove the given row from the dataset.
   *
   * @param row the row to remove
   */
  removeRow(row: number) {
    this.data.splice(row, 1);
  }

  /**
   * Shufle the dataset.
   */
  shuffle() {
    if (this.config.order.key.length)
      throw new Error('Cannot shuffle dataset if a order is provided!');
    this.data = _.shuffle(this.data);
  }

  /**
   * Print the table.
   */
  print() {
    // tslint:disable-next-line: no-console
    console.log(this.toString());
  }

  /**
   * Get the table as string.
   *
   * @returns the table string
   */
  toString() {
    this.build();
    return this.buildHeader() + '\n' + this.buildBody();
  }

  /**
   * Get the table as plain string without styling.
   *
   * @returns the plain table string
   */
  toPlainString() {
    const config = this.config;
    this._config = {
      ...getPlainConfig(this.config)
    };

    this.build(true);
    const res = this.buildHeader() + '\n' + this.buildBody();

    this._config = config;

    return res;
  }

  /**
   * Write the plain table to the given file (without style).
   *
   * @param filepath the filepath
   * @param mode the file's open mode
   */
  writeFile(filepath: string, mode: OpenMode = 'w') {
    const fd = openSync(filepath, mode);
    writeFileSync(fd, this.toPlainString(), {
      encoding: 'utf-8'
    });
  }

  /**
   * Write the plain table as .png file.
   *
   * @param filepath the filepath
   * @param fontSize the image's font size.
   */
  writeImage(filepath: string, fontSize: number = 16) {
    const fd = openSync(filepath, 'w');
    writeFileSync(
      fd,
      text2png(this.toPlainString(), {
        backgroundColor: 'black',
        color: 'white',
        font: `${fontSize}px Consolas`,
        padding: 4
      }),
      {
        encoding: 'utf-8'
      }
    );
  }

  /**
   * Get the character padding of given size
   *
   * @param size the padding size
   * @returns the character padding
   */
  private getPadding(size: number) {
    return this.config.padding.char.repeat(Math.max(size, 0));
  }

  /**
   * Get the width of the given column.
   *
   * @param col the column
   * @returns the column's width
   */
  private getColumnWidth(col: string | number) {
    const { header } = this.config;
    const colName = _.isNumber(col) ? this.columnNames[col] : col;
    if (_.isNumber(header.maxWidth)) return Math.min(this.columnWidths[colName], header.maxWidth);
    return this.columnWidths[colName];
  }

  /**
   * Check whether the given text is a `border` character.
   *
   * @param text the text to check
   * @returns whether the text is a `border` character
   */
  private isBorder(text: string) {
    const { border } = this.config;
    return (
      (border.horizontal.length && text === border.horizontal) ||
      (border.vertical.length && text === border.vertical)
    );
  }

  /**
   * Sort the dataset using a given sort order.
   *
   * @param order the sort order
   */
  private sort(order: Order) {
    const { key, direction } = order;

    if (this.data.length) {
      const type = typeof this.getDataCell(0, key);

      switch (type) {
        case 'number':
          this.data.sort((a, b) => (direction === 'ASC' ? a[key] - b[key] : b[key] - a[key]));
          break;
        case 'string':
          this.data.sort((a, b) =>
            direction === 'ASC' ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key])
          );
        default:
          break;
      }
    }
  }

  /**
   * Build the header names from the dataset.
   */
  private buildHeaderNames() {
    if (!this.data.length) return;

    const names = [];
    if (Array.isArray(this.data[0]))
      for (let i = 0; i < this.data[0].length; i++) names.push(String(i));
    else for (const col of Object.keys(this.data[0])) names.push(col);

    if (this.config.header.numeration) names.unshift('#');
    this.columnNames = names;
  }

  /**
   * Get the values of the computed row.
   *
   * @returns the values of the computed row
   */
  private getComputedRow() {
    const { computed } = this.config;
    const { columns } = computed;

    if (!columns.length) return {};

    const values = {};

    // Initalize empty arrays
    for (const comp of columns) values[comp.column] = [];

    // Collect row data
    for (const row of this.data)
      for (const col of columns) values[col.column].push(row[col.column] || '');

    // Compute
    for (const comp of columns) values[comp.column] = getComputed(values[comp.column], comp.func);

    return values;
  }

  /**
   * Calculate the width of each column.
   */
  private calculateColumnWidths() {
    const { header } = this.config;
    const widths: ColumnWidths = {};

    const data = this.data.slice();

    if (this._computed && Object.keys(this._computed).length) data.push(this._computed as T);

    if (_.isNumber(header.width)) {
      // Fixed width
      for (const name of this.columnNames) {
        if (name.length > header.width)
          throw new Error(`Column "${name}" is longer than max. column width (${header.width})`);
        widths[name] = header.width;
      }
    } else {
      // Initalize with column text length
      for (const name of this.columnNames) widths[name] = name.length;

      // Search longest string / value
      for (const row of data) {
        for (const name of this.columnNames) {
          if (name !== '#') {
            const width = this.parseCellText(row[name]).length;
            if (width > widths[name]) widths[name] = width;
          }
        }
      }

      if (header.numeration) widths['#'] = String(this.data.length).length || 1;
    }

    this.columnWidths = widths;
  }

  /**
   * Get the text of given given cell.
   *
   * @param row the cell's row index
   * @param col the cell's column name
   * @returns the cell content
   */
  private getCellText(row: number, col: string, full: boolean = false) {
    let res = '';
    if (row === -1) res = this.parseCellText(this._computed[col]) || '';
    else if (col === '#') res = this.parseCellText(row);
    else res = this.parseCellText(this.getDataCell(row, col));

    if (!full) res = res.substring(0, this.getColumnWidth(col));

    return res || '';
  }

  /**
   * Parse the given cell text to `String`.
   *
   * @param text the text to parse
   * @returns the parsed cell text
   */
  private parseCellText(text: any) {
    const { body } = this.config;

    if (Array.isArray(text) || _.isPlainObject(text)) return JSON.stringify(text);
    if (_.isNumber(text) && !_.isInteger(text)) return text.toFixed(body.precision);
    if (text === undefined) return '';

    return String(text) || '';
  }

  /**
   * Get the index of the given column.
   *
   * @param col the column's name
   * @returns the column's index
   */
  private columnToIndex(col: string) {
    return this.columnNames.findIndex((name) => name === col);
  }

  /**
   * Format the content of the given header cell.
   *
   * @param col cell's column index
   * @param content cell's content
   * @returns the formatted content
   */
  private formatHeaderCellContent(col: number, content: CellContent): [string, number] {
    const { bgColorColumns, border, header } = this.config;
    const { bgColor, bold, italic, textColor, underline } = header;

    const contentCopy = content.slice();

    // Border
    if (border.vertical.length) {
      if (col === 0) contentCopy.unshift(border.vertical);
      contentCopy.push(border.vertical);
    }

    const textIndex = contentCopy.length === 5 ? 2 : 1;

    let res = '';
    let len = 0;

    for (let i = 0; i < contentCopy.length; i++) {
      const text = contentCopy[i];
      let styled: Chalk = chalk;

      // Background
      if (bgColorColumns.length) {
        styled = styled.bgHex(bgColorColumns[col % bgColorColumns.length]);
      } else if (bgColor.length) {
        styled = styled.bgHex(bgColor);
      }

      if (this.isBorder(text) && border.color.length) styled.hex(border.color);
      else if (i === textIndex) {
        // Text color
        if (textColor.length) chalk.hex(textColor);

        // Font style
        if (bold) styled = styled.bold;
        if (italic) styled = styled.italic;
        if (underline) styled = styled.underline;
      }

      len += text.length;
      res += styled(text);
    }

    return [res, len];
  }

  /**
   * Calculate the header cell padding.
   *
   * @param col the cell's column name
   * @returns the padding
   */
  private calculateHeaderCellPadding(col: string) {
    const { padding } = this.config;
    return this.getColumnWidth(col) - col.length + padding.size;
  }

  /**
   * Build the given header cell.
   *
   * @param col the cell's column name
   * @returns the cell string
   */
  private buildHeaderCell(col: string): [string, number] {
    const { align, padding } = this.config;

    let content: CellContent;
    const colIndex = this.columnToIndex(col);

    switch (align) {
      case 'CENTER':
        const toFill = this.getColumnWidth(col) - col.length;
        const lrPadding = Math.floor(toFill / 2) + padding.size;
        content = [
          this.getPadding(lrPadding),
          col,
          this.getPadding(lrPadding + (toFill % 2 ? 1 : 0))
        ];
        break;

      case 'RIGHT':
        const lPadding = this.calculateHeaderCellPadding(col);
        content = [this.getPadding(lPadding), col, this.getPadding(padding.size)];
        break;

      default:
        const rPadding = this.calculateHeaderCellPadding(col);
        content = [this.getPadding(padding.size), col, this.getPadding(rPadding)];
    }

    return this.formatHeaderCellContent(colIndex, content);
  }

  /**
   * Build the header.
   *
   * @returns the header string
   */
  private buildHeader() {
    let res = '';
    let len = 0;

    for (const col of this.columnNames) {
      const [_res, _len] = this.buildHeaderCell(col);
      res += _res;
      len += _len;
    }

    this.tableWidth = len;

    res += '\n' + '='.repeat(len);

    return res;
  }

  /**
   * Format the content of the given body cell.
   *
   * @param row the cell's row index
   * @param col the cell's column index
   * @param content the cell's content
   * @returns the formatted content
   */
  private formatBodyCellContent(row: number, col: number, colName: string, content: CellContent) {
    const { bgColorColumns, body, border, computed } = this.config;
    const { highlightCell, textColor } = body;

    const contentCopy = content.slice();

    // Border
    if (border.vertical.length) {
      if (col === 0) contentCopy.unshift(border.vertical);
      contentCopy.push(border.vertical);
    }

    const textIndex = contentCopy.length === 5 ? 2 : 1;

    let res = '';
    for (let i = 0; i < contentCopy.length; i++) {
      const text = contentCopy[i];

      // Computed row
      if (row === -1 && computed.bgColor.length) {
        res += chalk.bgHex(computed.bgColor)(text);
        continue;
      }

      let styled: Chalk = chalk;

      // Column background
      if (bgColorColumns.length) styled = chalk.bgHex(bgColorColumns[col % bgColorColumns.length]);

      if (this.isBorder(text) && border.color.length) styled = styled.hex(border.color);
      else if (i === textIndex) {
        // Text color
        if (textColor.length) styled = styled.hex(textColor);

        // Highlight value
        if (
          _.isFunction(highlightCell.func) &&
          highlightCell.func(
            this.getDataCell(row, colName),
            row,
            _.isNumber(colName) ? +colName : colName
          )
        )
          styled = styled.hex(highlightCell.textColor);
      }

      res += styled(text);
    }

    return res;
  }

  /**
   * Calculate the body cell padding.
   *
   * @param row the cell's row index
   * @param col the cell's column name
   * @returns the padding
   */
  private calculateBodyCellPadding(row: number, col: string) {
    const { padding } = this.config;
    return this.getColumnWidth(col) - this.getCellText(row, col).length + padding.size;
  }

  /**
   * Build the given body cell.
   *
   * @param row the cell's row index
   * @param col the cell's column index
   * @returns the cell string
   */
  private buildBodyCell(row: number, col: number) {
    const { align, padding } = this.config;

    let content: CellContent;

    const colName = this.columnNames[col];
    const colText = this.getCellText(row, colName);
    const overflow = this.getCellText(row, colName, true).substring(this.getColumnWidth(colName));

    switch (align) {
      case 'CENTER':
        const toFill = this.getColumnWidth(colName) - colText.length;
        const lrPadding = Math.floor(toFill / 2) + padding.size;
        content = this.buildCellContent(lrPadding, colText, lrPadding + (toFill % 2 ? 1 : 0));
        break;

      case 'RIGHT':
        const lPadding = this.calculateBodyCellPadding(row, colName);
        content = this.buildCellContent(lPadding, colText, padding.size);
        break;

      default:
        const rPadding = this.calculateBodyCellPadding(row, colName);
        content = this.buildCellContent(padding.size, colText, rPadding);
    }

    return [this.formatBodyCellContent(row, col, colName, content), overflow];
  }

  /**
   * Format the content of the given body row.
   *
   * @param row the cell's row index
   * @param content the rows's content
   * @returns the formatted content
   */
  private formatBodyRowContent(row: number, content: string) {
    const { bgColor, highlightRow, striped } = this.config.body;

    let styled = chalk;

    // Background color
    if (_.isFunction(highlightRow.func) && highlightRow.func(this.data[row], row)) {
      styled = styled.bgHex(highlightRow.bgColor);
    } else if (striped && row % 2)
      styled = bgColor.length ? styled.bgHex(bgColor) : styled.bgHex('#444444');
    else if (bgColor.length) styled = styled.bgHex(bgColor);

    return styled(content);
  }

  /**
   * Get the row separator (border-bottom).
   *
   * @param separator the separator character
   * @returns the row separator string
   */
  private getRowSeparator(separator: string = this.config.border.horizontal) {
    return separator.length ? separator.repeat(this.tableWidth) + '\n' : '';
  }

  /**
   * Build a cell content.
   *
   * @param leftPadding the cell's left padding
   * @param text the cell's text
   * @param rightPadding the cell's right padding
   * @returns the cell content
   */
  private buildCellContent(leftPadding: number, text: string, rightPadding: number): CellContent {
    return [this.getPadding(leftPadding), text, this.getPadding(rightPadding)];
  }

  /**
   * Build an empty cell.
   *
   * @param col the cell's column
   * @returns an empty cell
   */
  private buildEmptyCell(col: string | number) {
    const { padding } = this.config;
    return this.buildCellContent(
      padding.size,
      this.getPadding(this.getColumnWidth(col)),
      padding.size
    );
  }

  /**
   * Build the given body row.
   *
   * @param row row's index
   * @returns row string
   */
  private buildBodyRow(row: number) {
    let content = '';
    let hasOverflow = false;
    const colsOverflow: string[] = [];

    for (let i = 0; i < this.columnNames.length; i++) {
      const [str, overflow] = this.buildBodyCell(row, i);
      content += str;
      colsOverflow.push(overflow);
      if (overflow.length) hasOverflow = true;
    }

    if (hasOverflow) content += this.buildBodyRowOverflow(row, colsOverflow);

    const formattedContent = this.formatBodyRowContent(row, content) + '\n';

    // Row separator
    const separator = this.getRowSeparator();

    return formattedContent + separator;
  }

  /**
   * Build the subsequent lines (overflow) of the given row.
   *
   * @param row the initial row
   * @param overflow the text overflow
   * @returns the subsequent lines
   */
  private buildBodyRowOverflow(row: number, overflow: string[]) {
    let content = '';
    let overflowLeft = false;

    content += '\n';

    for (let i = 0; i < overflow.length; i++) {
      const colName = this.columnNames[i];
      const colWidth = this.getColumnWidth(colName);
      const textLeft = overflow[i].substring(0, colWidth);

      if (!textLeft.length)
        content += this.formatBodyCellContent(row, i, colName, this.buildEmptyCell(colName));
      else {
        content += this.formatBodyCellContent(row, i, colName, [
          this.getPadding(this.config.padding.size),
          textLeft,
          this.getPadding(colWidth - textLeft.length + this.config.padding.size)
        ]);
        overflow[i] = overflow[i].substring(colWidth);
        if (overflow[i].length) overflowLeft = true;
      }
    }

    if (overflowLeft) content += this.buildBodyRowOverflow(row, overflow);

    return content;
  }

  /**
   * Build the body.
   *
   * @returns the body string
   */
  private buildBody() {
    let res = this.data.reduce((prev, __, i) => prev + this.buildBodyRow(i), '');
    if (this.config.computed.columns.length)
      res += this.getRowSeparator('-') + this.buildBodyRow(-1);

    // Remove last linebreak (\n)
    if (res.charCodeAt(res.length - 1) === 10) res = res.substring(0, res.length - 1);

    return res;
  }

  /**
   * Build the table
   *
   * @param force force the build
   */
  private build(force: boolean = false) {
    if (this.touched || force) {
      this._computed = this.getComputedRow();
      this.calculateColumnWidths();
      if (this.config.order.key.length) this.sort(this.config.order);
    }
    this.touched = false;
  }
}
