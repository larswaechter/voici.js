import _ from 'lodash';
import * as csv from 'fast-csv';
import * as jstream from 'JSONStream';
import text2png from 'text2png';
import chalk, { Chalk } from 'chalk';
import { resolve as resolvePath } from 'path';
import { createReadStream, openSync, writeFileSync, OpenMode } from 'fs';

import { getComputed } from './computed';
import {
  Config,
  ImageExportConfig,
  mergeDefaultConfig,
  mergeImageExportConfig,
  mergePlainConfig,
  Order
} from './config';

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
  /**
   * The dataset.
   */
  private _data: T[];

  /**
   * The table config.
   */
  private _config: Required<Config>;

  /**
   * The auto computed row.
   */
  private _computed: Partial<T>;

  /**
   * The column names.
   */
  private _columnNames: string[] = [];

  /**
   * The maximum width of each column.
   */
  private columnWidths: ColumnWidths;

  /**
   * The table width.
   */
  private tableWidth: number;

  /**
   * A flag to check whether the header or body has changed since the last build.
   */
  private touched: boolean = true;

  /**
   * Creates a new `Table` instance from a .csv file stream.
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
   * Creates a new `Table` instance from a .json file stream.
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
    this._config = mergeDefaultConfig(config);
    this.buildColumnNames();
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
   * Gets the value of the given cell in the dataset.
   *
   * @param row the cell's row
   * @param col the cell's col
   * @returns the cell's value
   */
  getDataCell(row: number, col: string | number) {
    const { header } = this.config;
    if (header.numeration && col === '#') return row;
    return this.data[row][col];
  }

  /**
   * Appends the given row to the dataset.
   *
   * @param row the row to append
   */
  appendRow(row: T) {
    this.data.push(row);
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
   * Removes the given column from the dataset.
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
        this.buildColumnNames();
      } else {
        const colName = _.isNumber(col) ? this.columnNames[col] : col;
        for (const row of this.data) {
          data.push(_.omit(row as {}, colName));
        }
        this.data = data;
        this.columnNames = this.columnNames.filter((name) => name !== colName);
      }
    }
  }

  /**
   * Shuffles the dataset.
   */
  shuffle() {
    if (this.config.order.key.length)
      throw new Error('Cannot shuffle dataset if a order is provided!');
    this.data = _.shuffle(this.data);
  }

  /**
   * Prints the table to the console.
   */
  print() {
    // tslint:disable-next-line: no-console
    console.log(this.toString());
  }

  /**
   * Prints the plain (unstyled) table to the console.
   */
  printPlain() {
    // tslint:disable-next-line: no-console
    console.log(this.toPlainString());
  }

  /**
   * Gets the table as string.
   * Can be used to print the table on the console.
   *
   * @returns the table string
   */
  toString() {
    this.build();
    return this.buildHeader() + '\n' + this.buildBody();
  }

  /**
   * Gets the table as plain string without styling.
   * Can be used to write the table to a file.
   *
   * @returns the plain table string
   */
  toPlainString() {
    const configBackup = this.config;
    this._config = {
      ...mergePlainConfig(this.config)
    };

    this.build(true);
    const res = this.buildHeader() + '\n' + this.buildBody();

    this._config = configBackup;

    return res;
  }

  /**
   * Exports the plain table to the given file (without style).
   *
   * @param filepath the filepath
   * @param mode the file's open mode
   */
  exportFile(filepath: string, mode: OpenMode = 'w') {
    const fd = openSync(filepath, mode);
    writeFileSync(fd, this.toPlainString(), {
      encoding: 'utf-8'
    });
  }

  /**
   * Exports the plain table as .png file.
   *
   * @param filepath the filepath
   * @param config the image export config
   */
  exportImage(filepath: string, config: ImageExportConfig = {}) {
    const fd = openSync(filepath, 'w');
    writeFileSync(fd, text2png(this.toPlainString(), mergeImageExportConfig(config)), {
      encoding: 'utf-8'
    });
  }

  /**
   * Gets the character padding of the given size.
   *
   * @param size the padding size
   * @returns the character padding
   */
  private getPadding(size: number) {
    return this.config.padding.char.repeat(size);
  }

  /**
   * Checks whether the given text is a `border` character.
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
   * Sorts the dataset using a given sort order.
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
   * Gets the raw text width of the given column.
   *
   * @param col the column
   * @returns the column's text width
   */
  private getColumnTextWidth(col: string | number) {
    const { header } = this.config;
    const colName = _.isNumber(col) ? this.columnNames[col] : col;
    if (_.isNumber(header.maxWidth)) return Math.min(this.columnWidths[colName], header.maxWidth);
    return this.columnWidths[colName];
  }

  /**
   * Builds the column names from the dataset.
   */
  private buildColumnNames() {
    if (!this.data.length) return;

    const names = [];
    if (Array.isArray(this.data[0]))
      for (let i = 0; i < this.data[0].length; i++) names.push(String(i));
    else for (const col of Object.keys(this.data[0])) names.push(col);

    if (this.config.header.numeration) names.unshift('#');
    this.columnNames = names;
  }

  /**
   * Calculates the width of each column.
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
   * Gets the index of the given column.
   *
   * @param col the column's name
   * @returns the column's index
   */
  private columnToIndex(col: string) {
    return this.columnNames.findIndex((name) => name === col);
  }

  /**
   * Gets the row separator (border-bottom).
   *
   * @param separator the separator character
   * @returns the row separator string
   */
  private getRowSeparator(separator: string = this.config.border.horizontal) {
    return separator.length ? separator.repeat(this.tableWidth) + '\n' : '';
  }

  /**
   * Gets the values of the computed row.
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
   * Builds a cell content array.
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
   * Builds an empty cell content.
   *
   * @param col the cell's column
   * @returns the empty cell content
   */
  private buildEmptyCellContent(col: string | number) {
    const { padding } = this.config;
    return this.buildCellContent(
      padding.size,
      this.getPadding(this.getColumnTextWidth(col)),
      padding.size
    );
  }

  /**
   * Parses the given cell text to `String`.
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
   * Gets the text of given the given cell.
   *
   * @param row the cell's row
   * @param col the cell's column
   * @param cropped whether the text should be cropped or not.
   * @returns the cell text
   */
  private getCellText(row: number, col: string, cropped: boolean = true) {
    let text = '';

    if (row === -1) text = this.parseCellText(this._computed[col]);
    else if (col === '#') text = this.parseCellText(row);
    else text = this.parseCellText(this.getDataCell(row, col));

    if (cropped) text = text.substring(0, this.getColumnTextWidth(col));

    return text;
  }

  /**
   * Calculates the header cell padding.
   *
   * @param col the cell's column
   * @returns the cell padding
   */
  private calculateHeaderCellPadding(col: string) {
    const { padding } = this.config;
    return this.getColumnTextWidth(col) - col.length + padding.size;
  }

  /**
   * Formats the content of the given header cell.
   *
   * @param col cell's column
   * @param content cell's content
   * @returns the formatted cell content and its text length
   */
  private formatHeaderCellContent(col: string, content: CellContent): [string, number] {
    const { bgColorColumns, border, header } = this.config;
    const { bgColor, bold, italic, textColor, underline } = header;

    const colIndex = this.columnToIndex(col);
    const contentCopy = content.slice();

    // Border
    if (border.vertical.length) {
      if (colIndex === 0) contentCopy.unshift(border.vertical);
      contentCopy.push(border.vertical);
    }

    const textIndex = contentCopy.length === 5 ? 2 : 1;

    let cellContent = '';
    let cellContentLen = 0;

    for (let i = 0; i < contentCopy.length; i++) {
      const text = contentCopy[i];
      let styled: Chalk = chalk;

      // Background
      if (bgColorColumns.length) {
        styled = styled.bgHex(bgColorColumns[colIndex % bgColorColumns.length]);
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

      cellContentLen += text.length;
      cellContent += styled(text);
    }

    return [cellContent, cellContentLen];
  }

  /**
   * Builds the given header cell content.
   *
   * @param col the cell's column
   * @returns the cell content and its text length
   */
  private buildHeaderCell(col: string): [string, number] {
    const { align, padding } = this.config;

    let content: CellContent;

    switch (align) {
      case 'CENTER':
        const toFill = this.getColumnTextWidth(col) - col.length;
        const lrPadding = Math.floor(toFill / 2) + padding.size;
        content = this.buildCellContent(lrPadding, col, lrPadding + (toFill % 2 ? 1 : 0));
        break;

      case 'RIGHT':
        const lPadding = this.calculateHeaderCellPadding(col);
        content = this.buildCellContent(lPadding, col, padding.size);
        break;

      default:
        const rPadding = this.calculateHeaderCellPadding(col);
        content = this.buildCellContent(padding.size, col, rPadding);
    }

    return this.formatHeaderCellContent(col, content);
  }

  /**
   * Builds the header.
   *
   * @returns the header content
   */
  private buildHeader() {
    let content = '';
    let contentLen = 0;

    for (const col of this.columnNames) {
      const [_res, _len] = this.buildHeaderCell(col);
      content += _res;
      contentLen += _len;
    }

    this.tableWidth = contentLen;

    content += '\n' + '='.repeat(contentLen);

    return content;
  }

  /**
   * Calculates the body cell padding.
   *
   * @param row the cell's row
   * @param col the cell's column
   * @returns the cell padding
   */
  private calculateBodyCellPadding(row: number, col: string) {
    const { padding } = this.config;
    return this.getColumnTextWidth(col) - this.getCellText(row, col).length + padding.size;
  }

  /**
   * Formats the content of the given body cell.
   *
   * @param row the cell's row
   * @param col the cell's column
   * @param content the cell's content
   * @returns the formatted cell content
   */
  private formatBodyCellContent(row: number, col: string, content: CellContent) {
    const { bgColorColumns, body, border, computed } = this.config;
    const { highlightCell, textColor } = body;

    const colIndex = this.columnToIndex(col);
    const contentCopy = content.slice();

    // Border
    if (border.vertical.length) {
      if (colIndex === 0) contentCopy.unshift(border.vertical);
      contentCopy.push(border.vertical);
    }

    const textIndex = contentCopy.length === 5 ? 2 : 1;

    let cellContent = '';
    for (let i = 0; i < contentCopy.length; i++) {
      const text = contentCopy[i];

      // Computed row
      if (row === -1 && computed.bgColor.length) {
        cellContent += chalk.bgHex(computed.bgColor)(text);
        continue;
      }

      let styled: Chalk = chalk;

      // Column background
      if (bgColorColumns.length)
        styled = chalk.bgHex(bgColorColumns[colIndex % bgColorColumns.length]);

      if (this.isBorder(text) && border.color.length) styled = styled.hex(border.color);
      else if (i === textIndex) {
        // Text color
        if (textColor.length) styled = styled.hex(textColor);

        // Highlight value
        if (
          _.isFunction(highlightCell.func) &&
          highlightCell.func(this.getDataCell(row, col), row, col)
        )
          styled = styled.hex(highlightCell.textColor);
      }

      cellContent += styled(text);
    }

    return cellContent;
  }

  /**
   * Builds the given body cell content.
   *
   * @param row the cell's row
   * @param col the cell's column
   * @returns the cell content
   */
  private buildBodyCell(row: number, col: string) {
    const { align, padding } = this.config;

    let content: CellContent;

    const colText = this.getCellText(row, col);
    const overflow = this.getCellText(row, col, false).substring(this.getColumnTextWidth(col));

    switch (align) {
      case 'CENTER':
        const toFill = this.getColumnTextWidth(col) - colText.length;
        const lrPadding = Math.floor(toFill / 2) + padding.size;
        content = this.buildCellContent(lrPadding, colText, lrPadding + (toFill % 2 ? 1 : 0));
        break;

      case 'RIGHT':
        const lPadding = this.calculateBodyCellPadding(row, col);
        content = this.buildCellContent(lPadding, colText, padding.size);
        break;

      default:
        const rPadding = this.calculateBodyCellPadding(row, col);
        content = this.buildCellContent(padding.size, colText, rPadding);
    }

    return [this.formatBodyCellContent(row, col, content), overflow];
  }

  /**
   * Formats the content of the given body row.
   *
   * @param row the cell's row
   * @param content the rows's content
   * @returns the formatted row content
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
   * Builds the given body row.
   *
   * @param row the row
   * @returns the row content
   */
  private buildBodyRow(row: number) {
    let content = '';
    let hasOverflow = false;
    const colsOverflow: string[] = [];

    for (const name of this.columnNames) {
      const [str, overflow] = this.buildBodyCell(row, name);
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
   * Builds the subsequent lines (overflow) of the given row.
   *
   * @param row the initial row
   * @param overflow the text overflow
   * @returns the subsequent lines
   */
  private buildBodyRowOverflow(row: number, overflow: string[]) {
    const { align, padding } = this.config;

    let content = '\n';
    let hasMore = false;

    for (let i = 0; i < overflow.length; i++) {
      const colName = this.columnNames[i];
      const colWidth = this.getColumnTextWidth(colName);
      const text = overflow[i].substring(0, colWidth);

      if (!text.length)
        content += this.formatBodyCellContent(row, colName, this.buildEmptyCellContent(colName));
      else {
        switch (align) {
          case 'CENTER':
            const toFill = colWidth - text.length;
            const lrPadding = Math.floor(toFill / 2) + padding.size;
            content += this.formatBodyCellContent(
              row,
              colName,
              this.buildCellContent(lrPadding, text, lrPadding + (toFill % 2 ? 1 : 0))
            );
            break;

          case 'RIGHT':
            content += this.formatBodyCellContent(
              row,
              colName,
              this.buildCellContent(colWidth - text.length + padding.size, text, padding.size)
            );
            break;

          default:
            content += this.formatBodyCellContent(
              row,
              colName,
              this.buildCellContent(padding.size, text, colWidth - text.length + padding.size)
            );
        }

        overflow[i] = overflow[i].substring(colWidth);
        if (overflow[i].length) hasMore = true;
      }
    }

    if (hasMore) content += this.buildBodyRowOverflow(row, overflow);

    return content;
  }

  /**
   * Builds the body.
   *
   * @returns the body content
   */
  private buildBody() {
    let content = this.data.reduce((prev, __, i) => prev + this.buildBodyRow(i), '');

    // Computed row
    if (this.config.computed.columns.length)
      content += this.getRowSeparator('-') + this.buildBodyRow(-1);

    // Remove last linebreak (\n)
    if (content.charCodeAt(content.length - 1) === 10)
      content = content.substring(0, content.length - 1);

    return content;
  }

  /**
   * Builds the table.
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
