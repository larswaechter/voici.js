import * as _ from 'lodash';
import { ComputedCell } from './computed';

export type Order = Partial<{
  key: string;
  direction: 'ASC' | 'DESC';
}>;

export type Config = Partial<{
  align: 'LEFT' | 'CENTER' | 'RIGHT';
  bgColorColumns: string[];
  body: Partial<{
    bgColor: string;
    highlightCell: Partial<{
      textColor: string;
      func: (content: any, row: number, col: string | number) => boolean;
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
    vertical: string;
    horizontal: string;
    color: string;
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
    size: number;
    char: string;
  }>;
}>;

export const getDefaultConfig = (config: Partial<Config>): Required<Config> =>
  _.merge(
    {
      align: 'LEFT',
      bgColorColumns: [],
      body: {
        bgColor: '',
        highlightCell: {
          textColor: '#FFBA08',
          func: null
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
        vertical: '',
        horizontal: '',
        color: ''
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
        key: '',
        direction: 'ASC'
      },
      padding: {
        size: 2,
        char: ' '
      }
    },
    config
  );

export const getPlainConfig = (config: Required<Config>): Required<Config> =>
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
    }
  });
