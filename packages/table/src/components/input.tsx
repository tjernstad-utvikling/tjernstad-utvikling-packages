import React, { useEffect, useState } from 'react';

import { TextField } from './ui/textField';

// A debounced input react component
export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  label,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  label: string;
  debounce?: number;
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

  return <TextField id={props.name} label={label} name={props.name} value={value} onChange={(e) => setValue(e.target.value)} />;
}
