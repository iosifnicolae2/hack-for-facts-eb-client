import type { ReactNode } from "react";

type TransProps = {
  children?: ReactNode;
  id?: string;
  message?: string;
};

export const Trans = ({ children, id, message }: TransProps) => (
  <>{children ?? message ?? id ?? ""}</>
);

type PluralProps = {
  value: number;
  zero?: ReactNode;
  one?: ReactNode;
  two?: ReactNode;
  few?: ReactNode;
  many?: ReactNode;
  other?: ReactNode;
};

export const Plural = ({
  value,
  zero,
  one,
  two,
  few,
  many,
  other,
}: PluralProps) => {
  if (value === 0 && zero !== undefined) {
    return <>{zero}</>;
  }
  if (value === 1 && one !== undefined) {
    return <>{one}</>;
  }
  if (value === 2 && two !== undefined) {
    return <>{two}</>;
  }
  return <>{other ?? many ?? few ?? one ?? ""}</>;
};

type SelectProps = {
  value: string;
  options: Record<string, ReactNode>;
};

export const Select = ({ value, options }: SelectProps) => (
  <>{options[value] ?? options.other ?? ""}</>
);

type SelectOrdinalProps = {
  value: number;
  one?: ReactNode;
  two?: ReactNode;
  few?: ReactNode;
  other?: ReactNode;
};

export const SelectOrdinal = ({
  value,
  one,
  two,
  few,
  other,
}: SelectOrdinalProps) => {
  if (value === 1 && one !== undefined) {
    return <>{one}</>;
  }
  if (value === 2 && two !== undefined) {
    return <>{two}</>;
  }
  return <>{other ?? few ?? ""}</>;
};
