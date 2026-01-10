export const t = (strings: TemplateStringsArray, ...values: unknown[]) =>
  strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");

export const msg = t;

export const defineMessage = <T>(value: T) => value;

export const plural = (
  value: number,
  options: {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other?: string;
  }
) => {
  if (value === 0 && options.zero !== undefined) {
    return options.zero;
  }
  if (value === 1 && options.one !== undefined) {
    return options.one;
  }
  if (value === 2 && options.two !== undefined) {
    return options.two;
  }
  return (
    options.other ??
    options.many ??
    options.few ??
    options.one ??
    ""
  );
};

export const select = (value: string, options: Record<string, string>) =>
  options[value] ?? options.other ?? "";

export const selectOrdinal = (
  value: number,
  options: {
    one?: string;
    two?: string;
    few?: string;
    other?: string;
  }
) => {
  if (value === 1 && options.one !== undefined) {
    return options.one;
  }
  if (value === 2 && options.two !== undefined) {
    return options.two;
  }
  return options.other ?? options.few ?? "";
};
