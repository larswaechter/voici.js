import orderBy from 'lodash/orderBy';
import isNumber from 'lodash/isNumber';
import isInteger from 'lodash/isInteger';
import upperFirst from 'lodash/upperFirst';
import isFunction from 'lodash/isFunction';

import chalk, { Chalk } from 'chalk';
import { openSync, writeFileSync, OpenMode } from 'fs';

import { arrayIncludes, isEmpty, stringify } from './helper';
import { calculateAccumulation } from './accumulation';
import {
  Config,
  InferAttributes,
  mergeDefaultConfig,
  mergePlainConfig,
  InferDynamicAttributes,
  DatasetRow,
  InferDatasetRowAttributesOrigin,
  AccumulationRow,
  InferRowAttributesOrigin
} from './config';

type CellContent = [
  borderLeft: string,
  paddingLeft: string,
  text: string,
  paddingRight?: string,
  borderRight?: string
];

type BodyRowIndex = number;
type AccumulatedRowIndex = -1;
type RowIndex = AccumulatedRowIndex | BodyRowIndex;

function isAccumulatedRowIndex(arg: number): arg is AccumulatedRowIndex {
  return arg == -1;
}

export type Row = object | unknown[];

/**
 * Represent a dataset in tabular form.
 * The columns are infered from the dataset's first item.
 *
 * @typeParam TRow Type of a dataset row.
 * @typeParam TDColumns Type of the dynamic columns.
 */
export class Table<TRow extends Row, TDColumns extends object = never> {
  /**
   * The dataset.
   */
  private _dataset: DatasetRow<TRow, TDColumns>[];

  /**
   * The table config.
   */
  private _config: Required<Config<TRow, TDColumns>>;

  /**
   * The row containing the accumulated data.
   */
  private accumulatedRow: AccumulationRow<TRow, TDColumns>;

  /**
   * The column names.
   * Including the dynamic and origin column names
   */
  private columnNames: InferDatasetRowAttributesOrigin<TRow, TDColumns>[] = [];

  /**
   * The maximum width of each column.
   */
  private columnWidths: Map<InferDatasetRowAttributesOrigin<TRow, TDColumns>, number> = new Map();

  /**
   * The table width.
   */
  private tableWidth: number;

  /**
   * A flag to check whether the header or body has changed since the last build.
   * Prevents unnecessary builds.
   */
  private touched: boolean = true;

  /**
   * Creates a new `Table` instance.
   *
   * @param dataset the dataset
   * @param config the config
   */
  constructor(dataset: TRow[], config: Config<TRow, TDColumns> = {}) {
    this._config = mergeDefaultConfig(config);
    this.dataset = this.buildDataset(dataset);
    this.build();
  }

  public get dataset() {
    return this._dataset;
  }

  private set dataset(dataset: DatasetRow<TRow, TDColumns>[]) {
    const { body } = this._config;
    const { subset } = body;

    switch (subset.length) {
      case 1:
        this._dataset = dataset.slice(subset[0]);
        break;
      case 2:
        this._dataset = dataset.slice(...subset);
        break;
      default:
        this._dataset = dataset.slice();
    }

    this.touched = true;
  }

  public get config() {
    return this._config;
  }

  public get columns() {
    return this.columnNames;
  }

  public get shape(): [rows: number, columns: number] {
    return [this.dataset.length, this.columns.length];
  }

  /**
   * Gets the value of the given cell in the dataset.
   *
   * @param row the cell's row
   * @param col the cell's col
   * @returns the cell's value
   */
  getDataCell(row: RowIndex, col: InferDatasetRowAttributesOrigin<TRow, TDColumns>) {
    const { body } = this.config;
    const { fillEmpty } = body;

    const cell = row === -1 ? this.accumulatedRow[col] : this.dataset[row][col];
    if (isFunction(fillEmpty[col]) && isEmpty(cell)) return fillEmpty[col](this.dataset[row], row);

    return cell;
  }

  /**
   * Gets the table as string.
   * Can be used to print the table on the console.
   *
   * @returns the table string
   */
  toString() {
    this.build();
    return [this.buildHeader(), this.buildBody()].join('\n');
  }

  /**
   * Gets the table as plain string without any advanced styling.
   * Can be used for example to write the table to a file or to paste it anywhere as text.
   *
   * @returns the plain table string
   */
  toPlainString() {
    const configBackup = this.config;
    this._config = {
      ...mergePlainConfig(this.config)
    };

    this.build(true);
    const {
      header: { visible: headerVisible }
    } = this._config;

    const str = headerVisible ? this.buildHeader() + '\n' + this.buildBody() : this.buildBody();

    this._config = configBackup;

    return str;
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
   * Exports the plain table to the given file (without advanced style).
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
   * Merges the user dataset with the dynamic columns.
   *
   * @param dataset
   * @returns the new dataset
   */
  private buildDataset(dataset: TRow[]): DatasetRow<TRow, TDColumns>[] {
    const { header } = this.config;
    const { dynamic } = header;

    const dynamicColumnsNames = Object.keys(dynamic) as InferDynamicAttributes<TDColumns>[];

    // Merges each row of the dataset with the according dynamicColumns row.
    return dataset.map((row, i) => ({
      '#': i,
      ...row,
      ...dynamicColumnsNames.reduce(
        (prev, val) => ({ ...prev, [val]: dynamic[val](row, i) }),
        {} as DatasetRow<TRow, TDColumns>
      )
    }));
  }

  /**
   * Get the width of the console window.
   * Padding is substracted from the width.
   *
   * @returns the console width
   */
  private getConsoleWidth() {
    const { padding } = this.config;
    const numberOfCols = this.columnNames.length;
    return process.stderr.columns - numberOfCols * 2 * padding.size;
  }

  /**
   * Gets the character padding of the given `size`.
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
   * Sorts the dataset by the columns provided in {@link Table._config}.
   */
  private sort() {
    const { columns, directions } = this.config.sort;
    if (columns.length !== directions.length)
      throw new Error(
        `Number of columns (${columns.length}) does not match number of directions (${directions.length})`
      );
    this.dataset = orderBy(this.dataset, columns, directions);
  }

  /**
   * Calculates the width of the complete table.
   * The table width is based on the width of the columns, the padding and the border.
   *
   * @returns the table width
   */
  private calculateTableWidth() {
    const { padding, border } = this.config;
    const numberOfCols = this.columnNames.length;

    const borderLen = border.vertical.length ? border.vertical.length * (numberOfCols + 1) : 0;

    return (
      Array.from(this.columnWidths.values()).reduce((prev, val) => prev + val, 0) +
      numberOfCols * padding.size * 2 +
      borderLen
    );
  }

  /**
   * Builds the column names from the dataset in the right order.
   * The result is stored in {@link Table.columnNames}.
   *
   * All column names are converted to `string` in order to avoid
   * complications when using arrays and numbers and indices.
   */
  private buildColumnNames() {
    if (!this.dataset.length) return;

    const { header } = this.config;
    const { include, exclude, origin } = header;

    const names = new Set<InferDatasetRowAttributesOrigin<TRow, TDColumns>>();

    // Column order
    for (const col of header.order)
      names.add(col.toString() as InferDatasetRowAttributesOrigin<TRow, TDColumns>);

    if (origin && !names.has('#')) names.add('#');

    // Included columns / columns from dataset without excluded ones
    if (include.length) for (const col of include) names.add(col);
    else
      Object.keys(this.dataset[0]).forEach((col) => {
        if (!arrayIncludes(exclude, col) && col !== '#')
          names.add(col as InferDatasetRowAttributesOrigin<TRow, TDColumns>);
      });

    this.columnNames = Array.from(names);
  }

  /**
   * Gets the width of the given column.
   *
   * @param col the column
   * @returns the column's text width
   */
  private getColumnWidth(col: InferDatasetRowAttributesOrigin<TRow, TDColumns>) {
    return this.columnWidths.get(col);
  }

  /**
   * Gets the display name of the given column.
   *
   * @param col the column
   * @param cropped whether the column name should be cropped or not.
   * @returns the column's display name `string`
   */
  private getColumnDisplayName(
    col: InferDatasetRowAttributesOrigin<TRow, TDColumns>,
    cropped: boolean = false
  ): string {
    const { header } = this.config;
    const { displayNames } = header;

    let name = Object.prototype.hasOwnProperty.call(displayNames, col)
      ? displayNames[col as InferRowAttributesOrigin<TRow>]
      : col.toString();

    if (cropped) name = name.substring(0, this.getColumnWidth(col));

    return name;
  }

  /**
   * Calculates the width of all columns.
   * The result is stored in {@link Table.columnWidths}
   */
  private calculateColumnWidths() {
    const { header } = this.config;
    const widths = new Map<InferDatasetRowAttributesOrigin<TRow, TDColumns>, number>();

    const data = this.dataset.slice();
    const colNames = this.columnNames;

    if (isNumber(header.width)) {
      // Fixed width
      for (const name of colNames) widths.set(name, header.width);
    } else {
      // Add accumulated row to dataset
      if (Object.keys(this.accumulatedRow).length)
        data.push(this.accumulatedRow as DatasetRow<TRow, TDColumns>); // TODO:

      const maxWidth =
        isNumber(header.maxWidth) && header.maxWidth > 0
          ? +header.maxWidth
          : Number.MAX_SAFE_INTEGER;

      // Initalize with maxWidth / column text length
      for (const name of colNames)
        widths.set(name, Math.min(this.getColumnDisplayName(name).length, maxWidth));

      // Search longest string / value
      for (const col of colNames) {
        for (let iRow = 0; iRow < data.length; iRow++) {
          const text = this.getDataCell(iRow === this.dataset.length ? -1 : iRow, col); // -1 => accumulated row
          const textLen = Math.min(this.parseCellText(text).length, maxWidth);
          widths.set(col, Math.max(widths.get(col), textLen));
        }
      }

      if (header.origin) widths.set('#', String(this.dataset.length).length || 1);

      const consoleWidth = this.getConsoleWidth();
      const widthSum = Array.from(widths.values()).reduce((prev, val) => prev + val, 0);

      // Calculate percentage
      if (
        header.width === 'stretch' ||
        (process.env.NODE_ENV !== 'test' && widthSum >= consoleWidth)
      )
        for (const key of widths.keys())
          widths.set(key, Math.floor((widths.get(key) / widthSum) * consoleWidth));
    }

    this.columnWidths = widths;
  }

  /**
   * Gets the index of the given column.
   *
   * @param col the column's name
   * @returns the column's index
   */
  private getColumnIndex(col: InferDatasetRowAttributesOrigin<TRow, TDColumns>) {
    return this.columnNames.findIndex((name) => name === col);
  }

  /**
   * Builds the row separator.
   *
   * @param separator the separator character
   * @returns the row separator string
   */
  private buildRowSeparator(separator: string) {
    return separator.repeat(this.tableWidth);
  }

  /**
   * Computes the rows of the accumulated columns.
   *
   * @returns the calculated rows
   */
  private calculateAccumulation(): AccumulationRow<TRow, TDColumns> {
    const { accumulation } = this.config.body;
    const { columns } = accumulation;

    const names = Object.keys(columns) as InferDatasetRowAttributesOrigin<TRow, TDColumns>[];

    if (!names.length) return {} as AccumulationRow<TRow, TDColumns>;

    // For each column store the values in an array
    const container = new Map<InferDatasetRowAttributesOrigin<TRow, TDColumns>, unknown[]>();

    // Initalize empty arrays
    for (const col of names) container.set(col, []);

    // Collect row data
    for (let iRow = 0; iRow < this.dataset.length; iRow++) {
      const row = this.dataset[iRow];
      for (const col of names) {
        container.get(col).push(row[col as string]);
      }
    }

    // Calculate acc value for each column
    const results: AccumulationRow<TRow, TDColumns> = {} as AccumulationRow<TRow, TDColumns>;
    for (const col of names) results[col] = calculateAccumulation(container.get(col), columns[col]);

    return results;
  }

  /**
   * Builds a cell content array.
   *
   * @param padLeft the cell's left padding
   * @param text the cell's text
   * @param padRight the cell's right padding
   * @returns the cell content
   */
  private buildCellContent(padLeft: number, text: string, padRight: number): CellContent {
    return [this.getPadding(padLeft), text, this.getPadding(padRight)];
  }

  /**
   * Builds an empty cell content.
   *
   * @param col the cell's column
   * @returns the empty cell content
   */
  private buildEmptyCellContent(col: InferDatasetRowAttributesOrigin<TRow, TDColumns>) {
    const { padding } = this.config;
    return this.buildCellContent(
      padding.size,
      this.getPadding(this.getColumnWidth(col)),
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
    if (isNumber(text) && !isInteger(text)) return text.toFixed(this.config.body.precision);
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
  private getCellText(
    row: RowIndex,
    col: InferDatasetRowAttributesOrigin<TRow, TDColumns>,
    cropped: boolean = true
  ) {
    let text = '';

    if (isAccumulatedRowIndex(row)) text = this.parseCellText(this.accumulatedRow[col]);
    else text = this.parseCellText(this.getDataCell(row, col));

    text = text.trim();

    if (cropped) text = text.substring(0, this.getColumnWidth(col));

    return text;
  }

  /**
   * Builds the subsequent lines (overflow) of the given row.
   * Set `row=0` for the header.
   *
   * @param row the initial row
   * @param overflow the text overflow for each solumn
   * @returns the subsequent lines
   */
  private buildRowOverflow(row: RowIndex, overflow: string[]) {
    const { align, padding } = this.config;

    let content = '\n';

    // A overflowed row might have overflow as well (makes sense, right?)
    let hasOverflow = false;

    for (let i = 0; i < overflow.length; i++) {
      const colName = this.columnNames[i];
      const colWidth = this.getColumnWidth(colName);
      const text = overflow[i].substring(0, colWidth);

      if (!text.length)
        content +=
          row == 0
            ? this.formatHeaderCellContent(colName, this.buildEmptyCellContent(colName))
            : this.formatBodyCellContent(row, colName, this.buildEmptyCellContent(colName));
      else {
        switch (align) {
          case 'CENTER':
            const paddingSize = colWidth - text.length;
            const paddingLR = Math.floor(paddingSize / 2) + padding.size;
            const cellContentCenter = this.buildCellContent(
              paddingLR,
              text,
              paddingLR + (paddingSize % 2 ? 1 : 0)
            );

            content +=
              row == 0
                ? this.formatHeaderCellContent(colName, cellContentCenter)
                : this.formatBodyCellContent(row, colName, cellContentCenter);
            break;

          case 'RIGHT':
            const cellContentRight = this.buildCellContent(
              colWidth - text.length + padding.size,
              text,
              padding.size
            );

            content +=
              row == 0
                ? this.formatHeaderCellContent(colName, cellContentRight)
                : this.formatBodyCellContent(row, colName, cellContentRight);
            break;

          default:
            const cellContentLeft = this.buildCellContent(
              padding.size,
              text,
              colWidth - text.length + padding.size
            );

            content +=
              row == 0
                ? this.formatHeaderCellContent(colName, cellContentLeft)
                : this.formatBodyCellContent(row, colName, cellContentLeft);
        }

        // Cut overflow and check if there's more left
        overflow[i] = overflow[i].substring(colWidth);
        if (overflow[i].length) hasOverflow = true;
      }
    }

    if (hasOverflow) content += this.buildRowOverflow(row, overflow);

    return content;
  }

  /**
   * Calculates the header cell padding.
   * The padding is based on the column's width and its display name.
   *
   * @param col the cell's column
   * @returns the cell padding
   */
  private calculateHeaderCellPadding(col: InferDatasetRowAttributesOrigin<TRow, TDColumns>) {
    const { padding } = this.config;
    return this.getColumnWidth(col) - this.getColumnDisplayName(col, true).length + padding.size;
  }

  /**
   * Formats the content of the given header cell.
   * The return value includes also the content's length because the content also contains ANSI escape codes.
   *
   * @param col cell's column
   * @param content cell's content
   * @returns the formatted cell content and its length
   */
  private formatHeaderCellContent(
    col: InferDatasetRowAttributesOrigin<TRow, TDColumns>,
    content: CellContent
  ) {
    const { bgColorColumns, border, header } = this.config;
    const { bgColor, bold, italic, lowercase, textColor, underline, uppercase, upperfirst } =
      header;

    const colIndex = this.getColumnIndex(col);
    const contentCopy: CellContent = [...content];

    if (border.vertical.length) {
      if (colIndex === 0) contentCopy.unshift(border.vertical); // left border
      contentCopy.push(border.vertical); // right border
    }

    // Index of the header cell's text inside content tuple
    const textIndex = contentCopy.length === 5 ? 2 : 1;

    /**
     * Apply header cell styling:
     *  - background color
     *  - border color
     *  - text color
     *  - text / font style
     */

    let cellContent = '';

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
        if (textColor.length) styled = styled.hex(textColor);

        if (uppercase) text = text.toUpperCase();
        else if (lowercase) text = text.toLowerCase();
        else if (upperfirst) text = upperFirst(text);

        // Font style
        if (bold) styled = styled.bold;
        if (italic) styled = styled.italic;
        if (underline) styled = styled.underline;
      }

      cellContent += styled(text);
    }

    return cellContent;
  }

  /**
   * Builds the given header cell content.
   *
   * @param col the cell's column
   * @returns the built cell content
   */
  private buildHeaderCell(
    col: InferDatasetRowAttributesOrigin<TRow, TDColumns>
  ): [content: string, overflow: string] {
    const { align, padding } = this.config;

    let content: CellContent;
    const displayName = this.getColumnDisplayName(col, true);
    const overflow = this.getColumnDisplayName(col).substring(this.getColumnWidth(col)).trim();

    switch (align) {
      case 'CENTER':
        const paddingSize = this.getColumnWidth(col) - displayName.length;
        const paddingLR = Math.floor(paddingSize / 2) + padding.size;
        content = this.buildCellContent(
          paddingLR,
          displayName,
          paddingLR + (paddingSize % 2 ? 1 : 0)
        );
        break;

      case 'RIGHT':
        const paddingL = this.calculateHeaderCellPadding(col);
        content = this.buildCellContent(paddingL, displayName, padding.size);
        break;

      default:
        const paddingR = this.calculateHeaderCellPadding(col);
        content = this.buildCellContent(padding.size, displayName, paddingR);
    }

    return [this.formatHeaderCellContent(col, content), overflow];
  }

  /**
   * Builds the header.
   *
   * @returns the built header
   */
  private buildHeader() {
    const { header } = this.config;

    let rowContent = '';
    let hasOverflow = false;

    // Overflowed text that did not fit in 1 single row
    const txtOverflow: string[] = [];

    for (const col of this.columnNames) {
      const [cell, overflow] = this.buildHeaderCell(col);
      rowContent += cell;

      txtOverflow.push(overflow);
      if (overflow.length) hasOverflow = true;
    }

    if (hasOverflow) rowContent += this.buildRowOverflow(0, txtOverflow);

    rowContent += '\n' + this.buildRowSeparator(header.separator);

    return rowContent;
  }

  /**
   * Calculates the body cell padding.
   *
   * @param row the cell's row
   * @param col the cell's column
   * @returns the cell padding
   */
  private calculateBodyCellPadding(
    row: RowIndex,
    col: InferDatasetRowAttributesOrigin<TRow, TDColumns>
  ) {
    const { padding } = this.config;
    return this.getColumnWidth(col) - this.getCellText(row, col).length + padding.size;
  }

  /**
   * Formats the content of the given body cell.
   *
   * @param row the cell's row
   * @param col the cell's column
   * @param content the cell's content
   * @returns the formatted cell content
   */
  private formatBodyCellContent(
    row: RowIndex,
    col: InferDatasetRowAttributesOrigin<TRow, TDColumns>,
    content: CellContent
  ) {
    const { bgColorColumns, body, border } = this.config;
    const { accumulation, highlightCell, textColor } = body;

    const colIndex = this.getColumnIndex(col);
    const contentCopy: CellContent = [...content];

    if (border.vertical.length) {
      if (colIndex === 0) contentCopy.unshift(border.vertical); // left border
      contentCopy.push(border.vertical); // right border
    }

    // Index of the body cell's text inside content tuple
    const textIndex = contentCopy.length === 5 ? 2 : 1;

    let cellContent = '';
    for (let i = 0; i < contentCopy.length; i++) {
      const text = contentCopy[i];

      // Calculated row
      if (isAccumulatedRowIndex(row) && accumulation.bgColor.length) {
        cellContent += chalk.bgHex(accumulation.bgColor)(text);
        continue;
      }

      /**
       * Apply body cell styling:
       *  - background color
       *  - border color
       *  - text color
       */

      let styled: Chalk = chalk;

      // Column background
      if (bgColorColumns.length)
        styled = chalk.bgHex(bgColorColumns[colIndex % bgColorColumns.length]);

      if (this.isBorder(text) && border.color.length) styled = styled.hex(border.color);
      else if (i === textIndex) {
        if (textColor.length) styled = styled.hex(textColor);

        // Highlight value
        if (
          isFunction(highlightCell.func) &&
          highlightCell.func(
            this.getDataCell(row, col),
            row,
            col as InferAttributes<TRow, TDColumns>
          )
        ) {
          styled = styled.hex(highlightCell.textColor);
          if (highlightCell.bold) styled = styled.bold;
          if (highlightCell.italic) styled = styled.italic;
          if (highlightCell.underline) styled = styled.underline;
        }
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
   * @returns the built cell content
   */
  private buildBodyCell(
    row: RowIndex,
    col: InferDatasetRowAttributesOrigin<TRow, TDColumns>
  ): [content: string, overflow: string] {
    const { align, padding } = this.config;

    let content: CellContent;

    const cellText = this.getCellText(row, col);
    const overflow = this.getCellText(row, col, false).substring(this.getColumnWidth(col)).trim();

    // Set cell content with according padding
    switch (align) {
      case 'CENTER':
        const paddingSize = this.getColumnWidth(col) - cellText.length;
        const paddingLR = Math.floor(paddingSize / 2) + padding.size;
        content = this.buildCellContent(paddingLR, cellText, paddingLR + (paddingSize % 2 ? 1 : 0));
        break;

      case 'RIGHT':
        const paddingL = this.calculateBodyCellPadding(row, col);
        content = this.buildCellContent(paddingL, cellText, padding.size);
        break;

      default:
        const paddingR = this.calculateBodyCellPadding(row, col);
        content = this.buildCellContent(padding.size, cellText, paddingR);
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
  private formatBodyRowContent(row: RowIndex, content: string) {
    const { bgColor, highlightRow, striped } = this.config.body;

    // Background color
    if (isFunction(highlightRow.func) && highlightRow.func(this.dataset[row], row))
      return chalk.bgHex(highlightRow.bgColor)(content);

    if (striped && row % 2)
      return (bgColor.length ? chalk.bgHex(bgColor) : chalk.bgHex('#444444'))(content);

    if (bgColor.length) return chalk.bgHex(bgColor)(content);

    return chalk(content);
  }

  /**
   * Builds the horizontal border for the given row.
   *
   * @param row the row
   * @returns the horizontal row border
   */
  private buildBodyRowHorizontalBorder(row: RowIndex) {
    const { border } = this.config;
    const { color, groupSize, horizontal } = border;

    let str =
      horizontal.length && row < this.dataset.length - 1 && (row + 1) % groupSize === 0
        ? '\n' + this.buildRowSeparator(horizontal)
        : '';

    if (color && str.length) str = chalk.hex(color)(str);

    return str;
  }

  /**
   * Builds the given body row.
   *
   * @param row the row
   * @returns the built row content
   */
  private buildBodyRow(row: RowIndex) {
    const { body } = this.config;

    let rowContent = '';
    let hasOverflow = false;

    if (isFunction(body.filterRow) && !body.filterRow(this.dataset[row], row)) return '';

    // Overflowed text that did not fit in 1 single row
    const txtOverflow: string[] = [];

    for (const col of this.columnNames) {
      const [cell, overflow] = this.buildBodyCell(row, col);
      rowContent += cell;
      txtOverflow.push(overflow);
      if (overflow.length) hasOverflow = true;
    }

    if (hasOverflow) rowContent += this.buildRowOverflow(row, txtOverflow);

    const formattedContent = this.formatBodyRowContent(row, rowContent);
    const hzBorder = this.buildBodyRowHorizontalBorder(row);

    return formattedContent + hzBorder;
  }

  /**
   * Builds the peek row.
   * The placeholder row for the hidden rows if the `peek` config is set.
   *
   * @returns the peek row
   */
  private buildBodyPeekRow() {
    const { border } = this.config;
    const { horizontal, vertical } = border;

    const str: [string, string, string, string] = [
      border.vertical,
      '',
      border.vertical,
      this.buildBodyRowHorizontalBorder(1)
    ];

    const separatorLen = Math.floor(0.75 * this.tableWidth);
    const paddingSize = this.tableWidth - separatorLen - 2 * vertical.length;
    const paddingLR = Math.floor(paddingSize / 2);

    str[1] =
      this.getPadding(paddingLR) +
      '<' +
      (horizontal || '-').repeat(separatorLen - 2) +
      '>' +
      this.getPadding(paddingLR + (paddingSize % 2 ? 1 : 0));

    return str.join('');
  }

  /**
   * Builds the body.
   *
   * @returns the build body
   */
  private buildBody() {
    const { body } = this.config;
    const { peek } = body;

    let rows: string[] = [];

    // Peek
    if (
      (Array.isArray(peek) && peek[0] + peek[1] < this.dataset.length) ||
      (isNumber(peek) && peek > 0 && peek < this.dataset.length / 2)
    ) {
      const [lowerTo, upperFrom] = Array.isArray(peek)
        ? [peek[0], this.dataset.length - peek[1]]
        : [peek, this.dataset.length - peek];

      for (let i = 0; i < lowerTo; i++) rows.push(this.buildBodyRow(i)); // Top
      if (upperFrom < this.dataset.length && lowerTo > 0) rows.push(this.buildBodyPeekRow()); // Peek placeholder
      for (let i = upperFrom; i < this.dataset.length; i++) rows.push(this.buildBodyRow(i)); // Bottom
    } else {
      // No peek
      rows = this.dataset.map((_, i) => this.buildBodyRow(i));
    }

    // Row of accumulation results
    if (Object.keys(body.accumulation.columns).length)
      rows.push(this.buildRowSeparator(body.accumulation.separator), this.buildBodyRow(-1));

    return rows.filter((row) => row.length).join('\n');
  }

  /**
   * Builds the table.
   * For performance reasons the table is only built if {@link Table.touched} is `true`.
   *
   * @param force force the build
   */
  private build(force: boolean = false) {
    if (this.touched || force) {
      this.buildColumnNames();
      this.accumulatedRow = this.calculateAccumulation();
      this.calculateColumnWidths();
      this.tableWidth = this.calculateTableWidth();
      if (this.config.sort.columns.length) this.sort();
    }
    this.touched = false;
  }
}
