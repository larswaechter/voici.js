import _ from 'lodash';
import text2png from 'text2png';
import chalk, { Chalk } from 'chalk';
import { openSync, writeFileSync, OpenMode } from 'fs';

import { calculateAccumulation } from './accumulation';
import {
  Config,
  ImageExportConfig,
  mergeDefaultConfig,
  mergeImageExportConfig,
  mergePlainConfig
} from './config';
import { stringify } from './helper';

export type Row =
  | {
      [key: string]: unknown;
    }
  | unknown[];

type ColumnWidths = {
  [key: string]: number;
};

/** paddingLeft, text, paddingRight */
type CellContent = [string, string, string];

export class Table<T extends unknown[] | object = Row> {
  /**
   * The dataset.
   */
  private _dataset: T[];

  /**
   * The table config.
   */
  private _config: Required<Config>;

  /**
   * The accumulated data.
   */
  private accumulatedRow: Partial<T>;

  /**
   * The dynamic columns' data.
   */
  private dynamicColumns: Map<string, unknown[]> = new Map();

  /**
   * The column names.
   */
  private columnNames: string[] = [];

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
   * Creates a new `Table` instance.
   *
   * @param dataset the dataset
   * @param config the config
   */
  constructor(dataset: T[], config: Config = {}) {
    this._dataset = dataset.slice();
    this._config = mergeDefaultConfig(config);

    this.buildColumnNames();
  }

  public get dataset() {
    return this._dataset;
  }

  private set dataset(dataset: T[]) {
    this._dataset = dataset;
    this.touched = true;
  }

  public get config() {
    return this._config;
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
    return this.dataset[row][col];
  }

  /**
   * Appends the given row to the dataset.
   *
   * @param row the row to append
   */
  appendRow(row: T) {
    this.dataset.push(row);
  }

  /**
   * Remove the given row from the dataset.
   *
   * @param row the row to remove
   */
  removeRow(row: number) {
    this.dataset.splice(row, 1);
  }

  /**
   * Removes the given column from the dataset.
   *
   * @param col the column to remove
   */
  removeColumn(col: string | number) {
    if (this.dataset.length) {
      const data = [];
      if (Array.isArray(this.dataset[0])) {
        for (const row of this.dataset) {
          if (Array.isArray(row)) {
            const copy = [...row];
            copy.splice(col as number, 1);
            data.push(copy);
          }
        }
        this.buildColumnNames();
      } else {
        const colName = _.isNumber(col) ? this.getColumNames()[col] : col;
        for (const row of this.dataset) {
          data.push(_.omit(row, colName));
        }
        this.dataset = data;
        this.columnNames = this.columnNames.filter((name) => name !== colName);
      }
    }
  }

  /**
   * Shuffles the dataset.
   */
  shuffle() {
    if (this.config.order.columns.length)
      throw new Error('Cannot shuffle dataset if a order is provided!');
    this.dataset = _.shuffle(this.dataset);
  }

  /**
   * Prints the table to the console.
   *
   * @param clear clear the console before printing
   */
  print(clear: boolean = false) {
    if (clear) console.clear();
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
   * Get the width of the console window.
   * Padding is substracted from the width.
   *
   * @returns the console width
   */
  private getConsoleWidth() {
    const { padding } = this.config;
    const numberOfCols = this.getColumNames().length;
    return process.stderr.columns - numberOfCols - 2 * padding.size;
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
   * Sorts the dataset.
   *
   */
  private sort() {
    const { columns, directions } = this.config.order;
    if (columns.length !== directions.length)
      throw new Error(
        `Number of columns (${columns.length}) does not match number of directions (${directions.length})`
      );
    this.dataset = _.orderBy(this.dataset, columns, directions);
  }

  /**
   * Get all column names to show.
   *
   * @returns the column names
   */
  private getColumNames() {
    const { header } = this.config;
    if (header.columns.length) return header.columns;
    return this.columnNames;
  }

  /**
   * Builds the column names from the dataset.
   */
  private buildColumnNames() {
    if (!this.dataset.length) return;

    const { header } = this.config;
    const names = [];

    // Column names from dataset
    for (const col in this.dataset[0]) names.push(String(col));

    // Names of dynamic columns
    for (const entry of header.dynamic) names.push(entry.name);

    if (header.numeration) names.unshift('#');

    for (const col of this.config.header.columns)
      if (!names.includes(col)) throw new Error(`Unknown column: ${col}`);

    this.columnNames = names;
  }

  /**
   * Gets the raw text width of the given column.
   *
   * @param col the column
   * @returns the column's text width
   */
  private getColumnTextWidth(col: string | number) {
    const { header } = this.config;
    const colName = _.isNumber(col) ? this.getColumNames()[col] : col;
    if (_.isNumber(header.maxWidth)) return Math.min(this.columnWidths[colName], header.maxWidth);
    return this.columnWidths[colName];
  }

  /**
   * Calculates the width of each column.
   */
  private calculateColumnWidths() {
    const { header } = this.config;
    const widths: ColumnWidths = {};

    const data = this.dataset.slice();
    const colNames = this.getColumNames().slice();

    // Add dynamic column names => use a Set for faster lookup
    const dynamicColNames = new Set<string>(this.getDynamicColumnsNames());
    colNames.push(...dynamicColNames.values());

    if (_.isNumber(header.width)) {
      // Fixed width
      for (const name of colNames) {
        if (name.length > header.width)
          throw new Error(`Column "${name}" is longer than max. column width (${header.width})`);
        widths[name] = header.width;
      }
    } else {
      // Add calculated row to dataset
      if (Object.keys(this.accumulatedRow).length) data.push(this.accumulatedRow as T);

      // Initalize with column text length
      for (const name of colNames) widths[name] = name.length;

      // Search longest string / value
      for (const col of colNames) {
        // Dynamic column
        if (dynamicColNames.has(col)) {
          const values = this.dynamicColumns.get(col);
          for (const val of values)
            widths[col] = Math.max(widths[col], this.parseCellText(val).length);
        } else {
          for (let iRow = 0; iRow < data.length; iRow++)
            widths[col] = Math.max(widths[col], this.parseCellText(data[iRow][col]).length);
        }
      }

      if (header.numeration) widths['#'] = String(this.dataset.length).length || 1;

      if (header.width === 'stretch') {
        const widthsArr = Object.values(widths);

        // Calculate percentage
        const consoleWidth = this.getConsoleWidth();
        const sum = Object.values(widthsArr).reduce((prev, val) => prev + val, 0);
        for (const key in widths) widths[key] = Math.floor((widths[key] / sum) * consoleWidth);
      }
    }

    this.columnWidths = widths;
  }

  /**
   * Gets the names of the dynamic columns.
   *
   * @returns the dynamic columns names.
   */
  private getDynamicColumnsNames() {
    return this.config.header.dynamic.map((col) => col.name);
  }

  /**
   * Calculates the data values for the each calculated column.
   *
   * @returns the calculated data values
   */
  private calculateDynamicColumns() {
    const { header } = this.config;
    const { dynamic } = header;

    const columns = new Map<string, unknown[]>();

    for (const col of dynamic) {
      const calculatedData = this.dataset.map((row, i) => col.func(row, i));
      columns.set(col.name, calculatedData);
    }

    return columns;
  }

  /**
   * Gets the index of the given column.
   *
   * @param col the column's name
   * @returns the column's index
   */
  private columnToIndex(col: string) {
    const dynamics = this.getDynamicColumnsNames();

    if (dynamics.includes(col))
      return dynamics.findIndex((name) => name === col) + this.getColumNames().length;

    return this.getColumNames().findIndex((name) => name === col);
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
   * Computes the values of the accumulated columns.
   *
   * @returns the computed row values
   */
  private calculateAccumulation() {
    const { accumulation } = this.config.body;
    const { columns } = accumulation;

    // Add dynamic column names => use a Set for faster lookup
    const dynamicColNames = new Set<string>(this.getDynamicColumnsNames());

    if (!columns.length) return {};

    const values = {};

    // Initalize empty arrays
    for (const comp of columns) values[comp.column] = [];

    // Collect row data
    for (let iRow = 0; iRow < this.dataset.length; iRow++) {
      const row = this.dataset[iRow];
      for (const col of columns) {
        if (dynamicColNames.has(String(col.column)))
          values[col.column].push(this.dynamicColumns.get(String(col.column))[iRow]);
        else values[col.column].push(row[col.column]);
      }
    }

    // Calculate
    for (const comp of columns)
      values[comp.column] = calculateAccumulation(values[comp.column], comp.func);

    return values;
  }

  /**
   * Builds a cell content array.
   *
   * @param paddingLeft the cell's left padding
   * @param text the cell's text
   * @param paddingRight the cell's right padding
   * @returns the cell content
   */
  private buildCellContent(paddingLeft: number, text: string, paddingRight: number): CellContent {
    return [this.getPadding(paddingLeft), text, this.getPadding(paddingRight)];
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
  private parseCellText(text: unknown) {
    if (_.isNumber(text) && !_.isInteger(text)) return text.toFixed(this.config.body.precision);
    return stringify(text);
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

    if (row === -1) text = this.parseCellText(this.accumulatedRow[col]);
    else if (col === '#') text = this.parseCellText(row);
    else if (Array.from(this.dynamicColumns.keys()).includes(col))
      text = this.parseCellText(this.dynamicColumns.get(col)[row]);
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
    const { bgColor, bold, italic, lowercase, textColor, underline, uppercase, upperfirst } =
      header;

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
      let text = contentCopy[i];
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

        if (uppercase) text = text.toUpperCase();
        else if (lowercase) text = text.toLowerCase();
        else if (upperfirst) text = _.upperFirst(text);

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

    for (const col of this.getColumNames()) {
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
    const { bgColorColumns, body, border } = this.config;
    const { accumulation, highlightCell, textColor } = body;

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

      // Calculate row
      if (row === -1 && accumulation.bgColor.length) {
        cellContent += chalk.bgHex(accumulation.bgColor)(text);
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
    if (_.isFunction(highlightRow.func) && highlightRow.func(this.dataset[row], row)) {
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

    for (const name of this.getColumNames()) {
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
      const colName = this.getColumNames()[i];
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
    let content = this.dataset.reduce((prev, __, i) => prev + this.buildBodyRow(i), '');

    // Row of accumulation results
    if (this.config.body.accumulation.columns.length)
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
      this.dynamicColumns = this.calculateDynamicColumns();
      this.accumulatedRow = this.calculateAccumulation();
      this.calculateColumnWidths();
      if (this.config.order.columns.length) this.sort();
    }
    this.touched = false;
  }
}
