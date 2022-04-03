import _merge from 'lodash/merge';
import { DynamicColumn, Accumulation } from './accumulation';

export type Order = {
  columns: string[];
  directions: Array<'asc'> | Array<'desc'>;
};

export type ImageExportConfig = Partial<{
  backgroundColor: string;
  color: string;
  font: string;
  padding: number;
}>;

export const mergeImageExportConfig = (config: ImageExportConfig): Required<ImageExportConfig> =>
  _merge(
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
    accumulation: Partial<{
      bgColor: string;
      columns: Accumulation[];
      separator: string;
    }>;
    bgColor: string;
    highlightCell: Partial<{
      func: (content: unknown, row: number, col: string | number) => boolean;
      textColor: string;
    }>;
    highlightRow: Partial<{
      bgColor: string;
      func: (row: unknown, index: number) => boolean;
    }>;
    precision: number;
    striped: boolean;
    textColor: string;
  }>;
  border: Partial<{
    color: string;
    groupSize: number;
    horizontal: string;
    vertical: string;
  }>;
  header: Partial<{
    bgColor: string;
    bold: boolean;
    columns: string[];
    dynamic: DynamicColumn[];
    italic: boolean;
    numeration: boolean;
    separator: string;
    textColor: string;
    underline: boolean;
    uppercase: boolean;
    lowercase: boolean;
    upperfirst: boolean;
    width: number | 'auto' | 'stretch';
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
  _merge(
    {
      align: 'LEFT',
      bgColorColumns: [],
      body: {
        accumulation: {
          bgColor: '',
          columns: [],
          separator: '-'
        },
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
        striped: false,
        textColor: ''
      },
      border: {
        color: '',
        groupSize: 1,
        horizontal: '',
        vertical: ''
      },
      header: {
        bgColor: '',
        bold: false,
        columns: [],
        dynamic: [],
        italic: false,
        numeration: false,
        separator: '=',
        textColor: '',
        underline: false,
        uppercase: false,
        lowercase: false,
        upperfirst: false,
        width: 'auto',
        maxWidth: 'auto'
      },
      order: {
        columns: [],
        directions: []
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
  _merge(config, {
    bgColorColumns: [],
    body: {
      calculated: {
        bgColor: ''
      },
      bgColor: '',
      highlightCell: {
        textColor: '',
        func: null
      },
      highlightRow: {
        bgColor: '',
        func: null
      },
      textColor: ''
    },
    border: {
      color: ''
    },
    header: {
      bgColor: '',
      bold: false,
      italic: false,
      textColor: '',
      underline: false
    },
    padding: {
      char: ' '
    }
  });
