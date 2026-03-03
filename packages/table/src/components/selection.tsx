import type { Row, Table } from '@tanstack/react-table';

import { Checkbox } from './ui/checkbox';
import React from 'react';
import { TableCell as TwTableCell } from './ui/table';

interface CheckboxCellProps<T extends {}> {
  isSelected: boolean;
  row: Row<T>;
  handleRowSelection: (event: React.MouseEvent<HTMLButtonElement>, row: Row<T>) => void;
}
export function CheckboxCell<T extends {}>({ isSelected, handleRowSelection, row }: CheckboxCellProps<T>) {
  return (
    <TwTableCell>
      <Checkbox
        // size="small"
        checked={isSelected}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleRowSelection(e, row)}
      />
    </TwTableCell>
  );
}

interface CheckboxHeaderCellProps<T extends {}> {
  selectedRows: Row<T>[];
  table: Table<T>;
  setSelected: ((rows: Row<T>[]) => void) | undefined;
  setSelectedRows: (value: Row<T>[]) => void;
}
export function CheckboxHeaderCell<T extends {}>({ selectedRows, table, setSelected, setSelectedRows }: CheckboxHeaderCellProps<T>) {
  const rows = table.getRowModel().rows;

  function setSelection() {
    if (rows.length === selectedRows.length) {
      setSelected && setSelected([]);
      setSelectedRows([]);
      return;
    }
    setSelected && setSelected(rows);
    setSelectedRows(rows);
  }

  return (
    <TwTableCell>
      <Checkbox
        checked={rows.length === selectedRows.length}
        indeterminate={selectedRows.length > 0 && rows.length > selectedRows.length}
        onClick={setSelection}
      />
    </TwTableCell>
  );
}
