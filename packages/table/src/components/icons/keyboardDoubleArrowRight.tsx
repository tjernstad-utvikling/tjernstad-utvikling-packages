import type { IconProps } from './type';
import React from 'react';
import { cn } from '../../lib/utils';

export function KeyboardDoubleArrowRight({ color, className, ...props }: IconProps) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('fill-current text-black', color, className)}
      {...props}
    >
      <path d="M9.575 12L5 7.4L6.4 6l6 6l-6 6L5 16.6L9.575 12Zm6.6 0L11.6 7.4L13 6l6 6l-6 6l-1.4-1.4l4.575-4.6Z"></path>
    </svg>
  );
}
