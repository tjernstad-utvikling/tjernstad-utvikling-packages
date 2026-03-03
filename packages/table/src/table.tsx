import { Table, TableBody, TableHeader, TableRow as TwTableRow } from './components/ui/table';
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type ExpandedState,
  type FilterFn,
  type GroupingState,
  type Row,
  type SortingState,
  type Updater,
  type VisibilityState
} from '@tanstack/react-table';
import { useEffect, useMemo, useRef, useState, type PropsWithChildren, type ReactElement } from 'react';

import { CheckboxHeaderCell } from './components/selection';
import { ColumnSelect } from './components/columnSelect';
import { DebouncedInput } from './components/input';
import { HeaderCell } from './components/header';
import React from 'react';
import type { TableProperties } from './types';
import { TableRow } from './components/row';
import { rankItem } from '@tanstack/match-sorter-utils';
import { useRowSelection } from './hooks/useRowSelection';

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

export function TuTable<T extends Record<string, unknown>>({ ...props }: PropsWithChildren<TableProperties<T>>): ReactElement {
  const [globalFilter, setGlobalFilter] = React.useState('');

  function updateGrouping(update: Updater<GroupingState>) {
    const grouping = update instanceof Function ? update(props.tableState.grouping) : update;
    props.setTableState((prev) => {
      return { ...prev, grouping };
    });
  }

  function updateColumnFilters(update: Updater<ColumnFiltersState>) {
    const columnFilters = update instanceof Function ? update(props.tableState.columnFilters) : update;
    props.setTableState((prev) => {
      return { ...prev, columnFilters };
    });
  }

  function updateVisibility(update: Updater<VisibilityState>) {
    const columnVisibility = update instanceof Function ? update(props.tableState.columnVisibility) : update;
    props.setTableState((prev) => {
      return { ...prev, columnVisibility };
    });
  }
  function updateExpanded(update: Updater<ExpandedState>) {
    const expanded = update instanceof Function ? update(props.tableState.expanded) : update;
    props.setTableState((prev) => {
      return { ...prev, expanded };
    });
  }

  function updateSorting(update: Updater<SortingState>) {
    const sorting = update instanceof Function ? update(props.tableState.sorting) : update;

    props.setTableState((prev) => {
      return { ...prev, sorting };
    });
  }

  /**Table instance */
  const table = useReactTable<T>({
    ...props,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    getCoreRowModel: getCoreRowModel(),
    state: {
      ...(props.tableState.sorting ? { sorting: props.tableState.sorting } : {}),
      expanded: props.tableState.expanded ?? {},
      columnVisibility: props.tableState.columnVisibility ?? {},
      ...(props.tableState.columnFilters ? { columnFilters: props.tableState.columnFilters } : {}),
      ...(props.tableState.grouping ? { grouping: props.tableState.grouping } : {}),
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,

    onColumnFiltersChange: updateColumnFilters,
    onGroupingChange: updateGrouping,
    onColumnVisibilityChange: updateVisibility,
    onExpandedChange: updateExpanded,
    onSortingChange: updateSorting,
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),

    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  });

  function getRowClassName(row: Row<T>) {
    if (props.getRowStyling !== undefined) {
      const className = props.getRowStyling(row);
      if (className !== undefined) {
        return className;
      }
    }
    return '';
  }

  const selectedRows = useMemo(() => {
    if (!props.enableSelection) return [] as Row<T>[];

    const selectedIds = new Set((props.selectedIds ?? []).map((id) => String(id)));
    return table.getPreFilteredRowModel().rows.filter((row) => selectedIds.has(String(row.getValue('id'))));
  }, [props.enableSelection, props.selectedIds, table]);

  const [localSelectedRows, setLocalSelectedRows] = useState<Row<T>[]>([]);
  const isMountedRef = useRef(false);
  const didInitSelectionRef = useRef(false);
  const setSelectedRef = useRef(props.setSelected);

  useEffect(() => {
    setSelectedRef.current = props.setSelected;
  }, [props.setSelected]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setLocalSelectedRows((prev) => {
      const prevIds = prev.map((row) => row.id);
      const nextIds = selectedRows.map((row) => row.id);
      const hasEqualSelection = prevIds.length === nextIds.length && prevIds.every((id) => nextIds.includes(id));

      if (hasEqualSelection) return prev;
      return selectedRows;
    });
  }, [selectedRows]);

  useEffect(() => {
    if (!props.enableSelection || !isMountedRef.current) return;

    if (!didInitSelectionRef.current) {
      didInitSelectionRef.current = true;
      return;
    }

    const notify = setSelectedRef.current;
    if (notify) notify(localSelectedRows);
  }, [localSelectedRows, props.enableSelection]);

  const localSelectedRowIdSet = useMemo(() => new Set(localSelectedRows.map((row) => row.id)), [localSelectedRows]);

  const handleRowSelection = useRowSelection({
    selectedRows: localSelectedRows,
    setSelectedRows: setLocalSelectedRows,
    table,
    enableSelection: props.enableSelection
  });

  return (
    <>
      <div>
        <div className="bg-background flex h-16">
          <div className="bg-inherit p-1">
            <DebouncedInput
              label="Søk i alle kolonner"
              name="search"
              value={globalFilter ?? ''}
              onChange={(value) => setGlobalFilter(String(value))}
            />
          </div>
          <div className="flex-grow">{props.children}</div>
          <ColumnSelect instance={table} />
        </div>
        <Table role="grid" aria-label="Table">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TwTableRow key={headerGroup.id}>
                {props.enableSelection && (
                  <CheckboxHeaderCell setSelectedRows={setLocalSelectedRows} selectedRows={localSelectedRows} table={table} />
                )}
                {headerGroup.headers.map((header) => {
                  return <HeaderCell key={header.id} header={header} table={table} />;
                })}
              </TwTableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* https://tailwindcomponents.com/component/indeterminate-progress-bar */}

            {table.getRowModel().rows.map((row) => {
              return (
                <TableRow<T>
                  enableSelection={props.enableSelection}
                  handleRowSelection={handleRowSelection}
                  key={row.id}
                  row={row}
                  state={props.tableState}
                  isSelected={localSelectedRowIdSet.has(row.id)}
                  rowClassName={getRowClassName(row)}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export { baseColors } from './style';
