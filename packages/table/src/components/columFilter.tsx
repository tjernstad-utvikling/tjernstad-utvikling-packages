import type { Column, Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { Button } from './ui/button';
import { FilterOff } from './icons/filterOff';
import React from 'react';
import { TextField } from './ui/textField';
import { Tooltip } from './ui/tooltip';

/* eslint-disable @typescript-eslint/ban-types */

interface FilterProps<T extends {}> {
  column: Column<T, unknown>;
  table: Table<T>;
}

export function ColumnFilter<T extends {}>({ column, table }: FilterProps<T>) {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return typeof firstValue === 'number' ? (
    <div>
      <div style={{ display: 'flex' }}>
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={(value) => column.setFilterValue((old: [number, number]) => [value, old?.[1]])}
          label={`Min`}
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={(value) => column.setFilterValue((old: [number, number]) => [old?.[0], value])}
          label={`Maks`}
        />
      </div>
    </div>
  ) : (
    <>
      <DebouncedInput
        type="text"
        id={column.id}
        value={(columnFilterValue ?? '') as string}
        onChange={(value) => column.setFilterValue(value)}
        label={`Søk...`}
      />
    </>
  );
}

interface FilterRemoveProps<T extends {}> {
  column: Column<T, unknown>;
  table: Table<T>;
}

export function FilterRemove<T extends {}>({ column }: FilterRemoveProps<T>) {
  if (column.getIsFiltered())
    return (
      <Tooltip tip={'Fjern filter for kolonne'}>
        <Button variant="link" size={'sm'} onClick={() => column.setFilterValue('')}>
          <FilterOff color="text-destructive" />
        </Button>
      </Tooltip>
    );
  return null;
}
// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  label,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
  label: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  if (props.type === 'text') {
    return (
      <>
        <TextField
          value={value}
          label={label}
          onChange={(e) => {
            setValue(e.target.value ?? '');
          }}
        />
      </>
    );
  }

  return (
    <TextField
      // size="small"
      id={props.id}
      className="w-300"
      label={label}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
