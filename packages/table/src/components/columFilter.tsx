import { Column, Table } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Button } from "./ui/button";
import { FilterOff } from "./icons/filterOff";
import React from "react";
import { TextField } from "./ui/textField";
import { Tooltip } from "./ui/tooltip";

/* eslint-disable @typescript-eslint/ban-types */

interface FilterProps<T extends {}> {
  column: Column<T, unknown>;
  table: Table<T>;
}

export function ColumnFilter<T extends {}>({ column, table }: FilterProps<T>) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = useMemo(
    () =>
      typeof firstValue === "number"
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firstValue]
  );

  return typeof firstValue === "number" ? (
    <div>
      <div style={{ display: "flex" }}>
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          label={`Min ${
            column.getFacetedMinMaxValues()?.[0]
              ? `(${column.getFacetedMinMaxValues()?.[0]})`
              : ""
          }`}
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          label={`Maks ${
            column.getFacetedMinMaxValues()?.[1]
              ? `(${column.getFacetedMinMaxValues()?.[1]})`
              : ""
          }`}
        />
      </div>
    </div>
  ) : (
    <>
      <DebouncedInput
        type="text"
        id={column.id}
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        label={`Søk... (${column.getFacetedUniqueValues().size})`}
        options={sortedUniqueValues
          .slice(0, 50)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((value: any) => value)}
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
      <Tooltip tip={"Fjern filter for kolonne"}>
        <Button
          variant="link"
          size={"sm"}
          onClick={() => column.setFilterValue("")}
        >
          <FilterOff />
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
  options,
  label,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
  options?: { name: string }[];
  label: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (props.type === "text") {
    //https://react-spectrum.adobe.com/react-spectrum/ComboBox.html
    return (
      <>
        <TextField label={label} />
        {/* <ComboBox
          label="Pick an engineering major"
          defaultItems={options}
          onSelectionChange={setValue}
        >
          {(item) => <Item>{item.name}</Item>}
        </ComboBox> */}
        {/* // <Autocomplete
      //   size="small"
      //   id={props.id}
      //   options={options ?? []}
      //   onChange={(_, value) => {
      //     setValue(value ?? "");
      //   }}
      //   sx={{ width: 300 }}
      //   renderInput={(params) => <TextField {...params} label={label} />}
      // />*/}
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
