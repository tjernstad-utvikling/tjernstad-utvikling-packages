import { ColumnDef, PaginationState, Row, TableState } from '@tanstack/react-table';

import { ColorStyleOptions } from './style';

export type TableProperties<T extends Record<string, unknown>> = {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  isLoading: boolean;
  children?: React.ReactNode;

  getRowStyling?: (row: Row<T>) => ColorStyleOptions | undefined;
  selectedRowClassName?: string;

  tableState: TableState;
  setTableState: (value: TableState | ((val: TableState) => TableState)) => void;
} & (
  | {
      manualPagination?: boolean;
      enablePagination: boolean;
      rowCount: number;
      paginationState: PaginationState;
      updatePagination: (v: PaginationState) => void;
    }
  | { enablePagination: boolean; manualPagination?: never; rowCount?: never; paginationState?: never; updatePagination?: never }
  | { enablePagination?: never; manualPagination?: never; rowCount?: never; paginationState?: never; updatePagination?: never }
) &
  (
    | {
        enableSelection: boolean;
        setSelected?: never;
        selectedIds?: never;
      }
    | {
        enableSelection: boolean;
        setSelected: (rows: Row<T>[]) => void;
        selectedIds: number[] | undefined;
      }
    | {
        enableSelection?: never;
        selectedIds?: never;
        setSelected?: never;
      }
  );
