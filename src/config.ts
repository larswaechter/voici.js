import * as _ from 'lodash';
import { ComputedCell } from './computed';

export type Order = Partial<{
  column: string;
  direction: 'ASC' | 'DESC';
}>;

export type ImageExportConfig = Partial<{
  backgroundColor: string;
  color: string;
  font: string;
  padding: number;
}>;

export const mergeImageExportConfig = (config: ImageExportConfig): Required<ImageExportConfig> =>
  _.merge(
    {
      backgroundColor: 'black',
      color: 'white',
      font: '16px Consolas',
      padding: 4
    },
    config
  );

export type Config = Partial<{
  align: 'LEFT' | 'CENTER' | 'RIGHT';
  bgColorColumns: string[];
  body: Partial<{
    bgColor: string;
    highlightCell: Partial<{
      func: (content: any, row: number, col: string | number) => boolean;
      textColor: string;
    }>;
    highlightRow: Partial<{
      bgColor: string;
      func: (row: any, index: number) => boolean;
    }>;
    precision: number;
    striped: boolean;
    textColor: string;
  }>;
  border: Partial<{
    color: string;
    horizontal: string;
    vertical: string;
  }>;
  computed: Partial<{
    bgColor: string;
    columns: ComputedCell[];
  }>;
  header: Partial<{
    bgColor: string;
    bold: boolean;
    italic: boolean;
    numeration: boolean;
    textColor: string;
    underline: boolean;
    width: number | 'auto';
    maxWidth: number | 'auto';
  }>;
  order: Order;
  padding: Partial<{
    char: string;
    size: number;
  }>;
}>;

/**
 * Merges the given config with the default config.
 *
 * @param config the config
 * @returns the merged config
 */
export const mergeDefaultConfig = (config: Partial<Config>): Required<Config> =>
  _.merge(
    {
      align: 'LEFT',
      bgColorColumns: [],
      body: {
        bgColor: '',
        highlightCell: {
          func: null,
          textColor: '#FFBA08'
        },
        highlightRow: {
          bgColor: '#FFBA08',
          func: null
        },
        precision: 3,
        striped: true,
        textColor: ''
      },
      border: {
        color: '',
        horizontal: '',
        vertical: ''
      },
      computed: {
        bgColor: '',
        columns: []
      },
      header: {
        bgColor: '',
        bold: false,
        italic: false,
        numeration: true,
        textColor: '',
        underline: true,
        width: 'auto',
        maxWidth: 'auto'
      },
      order: {
        column: '',
        direction: 'ASC'
      },
      padding: {
        char: ' ',
        size: 2
      }
    },
    config
  );

/**
 * Merges the given config with the plain config.
 * The plain config removes all styling options.
 *
 * @param config the config
 * @returns the merged config
 */
export const mergePlainConfig = (config: Required<Config>): Required<Config> =>
  _.merge(config, {
    bgColorColumns: [],
    body: {
      bgColor: '',
      highlightCell: {
        textColor: '',
        func: null
      },
      highlightRow: {
        bgColor: '',
        func: null
      },
      striped: false,
      textColor: ''
    },
    border: {
      color: ''
    },
    computed: {
      bgColor: ''
    },
    header: {
      bgColor: '',
      bold: false,
      italic: false,
      textColor: '',
      underline: false
    },
    padding: {
      char: '.'
    }
  });
