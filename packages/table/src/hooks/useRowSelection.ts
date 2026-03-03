import type { Row, Table } from '@tanstack/react-table';
import { useCallback, useRef } from 'react';

interface UseRowSelectionProps<T> {
  selectedRows: Row<T>[];
  table: Table<T>;
  setSelectedRows: (rows: Row<T>[]) => void;
  setSelected?: (rows: Row<T>[]) => void;
  enableSelection?: boolean;
}

export function useRowSelection<T>({ selectedRows, table, setSelectedRows, setSelected, enableSelection }: UseRowSelectionProps<T>) {
  const lastSelectedRow = useRef<Row<T> | undefined>(undefined);
  const lastRowUnchecked = useRef<boolean>(false);

  /**
   * Handle Row Selection:
   *
   * 1. Click + CMD/CTRL - Select multiple rows
   * 2. Click + SHIFT - Range Select multiple rows
   */
  return useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, row: Row<T>) => {
      // See if row is already selected
      const selectedRowIds = selectedRows?.map((r) => r.id) ?? [];
      const selectIndex = selectedRowIds.indexOf(row.id);
      const isSelected = selectIndex > -1;

      let updatedSelectedRows = [...(selectedRows ? selectedRows : [])];

      if (event.ctrlKey || event.metaKey || !event.shiftKey) {
        // 1. Click + CMD/CTRL - select multiple rows

        // Remove clicked element from list
        if (isSelected) {
          updatedSelectedRows.splice(selectIndex, 1);
        } else {
          updatedSelectedRows.push(row);
        }
      } else if (event.shiftKey) {
        // 2. Click + SHIFT - Range Select multiple rows

        if (lastSelectedRow.current) {
          // Calculate array indexes and reset selected rows

          const lastIndex = table.getRowModel().rows.findIndex((r) => r.index === lastSelectedRow.current?.index);

          const currentIndex = table.getRowModel().rows.findIndex((r) => r.index === row.index);

          // If last row was unchecked remove range
          if (lastRowUnchecked.current) {
            if (lastIndex < currentIndex) {
              for (let i = lastIndex + 1; i <= currentIndex; i++) {
                const selectedRow = table.getRowModel().rows[i];
                // Skip row if selected or grouped row
                if (!selectedRow?.getIsGrouped()) {
                  // return selectedRow;
                  updatedSelectedRows = updatedSelectedRows.filter((elm) => elm.id !== selectedRow?.id);
                }
              }
            } else {
              for (let i = currentIndex; i < lastIndex; i++) {
                const selectedRow = table.getRowModel().rows[i];
                // Skip row if selected or grouped row
                if (!selectedRow?.getIsGrouped()) {
                  // return selectedRow;
                  updatedSelectedRows = updatedSelectedRows.filter((elm) => elm.id !== selectedRow?.id);
                }
              }
            }
          } else {
            if (selectedRows?.length) {
              if (lastIndex < currentIndex) {
                for (let i = lastIndex + 1; i <= currentIndex; i++) {
                  selectRange(i, updatedSelectedRows, table);
                }
              } else {
                for (let i = currentIndex; i < lastIndex; i++) {
                  selectRange(i, updatedSelectedRows, table);
                }
              }
            } else {
              // No rows previously selected, select only current row
              updatedSelectedRows = [row];
            }
          }
        }
      }

      if (setSelected && enableSelection) {
        setSelectedRows(updatedSelectedRows);
        setSelected(updatedSelectedRows);
      }
      // set lastSelectedRow for reference to shift select
      lastSelectedRow.current = row;
      lastRowUnchecked.current = isSelected;
    },
    [selectedRows, setSelected, enableSelection, table]
  );
}

/**
 * Add selectable row
 */
function selectRange<T>(index: number, update: Row<T>[], table: Table<T>) {
  const selectedRow = table.getRowModel().rows[index];
  // Skip row if selected or grouped row
  if (!selectedRow?.getIsGrouped() && !update.find((elm) => elm.id === selectedRow?.id)) {
    // return selectedRow;
    if (selectedRow) update.push(selectedRow);
  }
}
