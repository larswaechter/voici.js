/**
 * Counts the occurrences of each value.
 *
 * @param data  the dataset
 * @returns a `Map<Value, Occurrences>` map
 */
export const countOccurrences = (data: unknown[]) => {
  const table = new Map<string, number>();

  for (const value of data) {
    const str = String(value);
    if (str === 'undefined') continue;
    if (table.has(str)) table.set(str, table.get(str) + 1);
    else table.set(str, 1);
  }

  return table;
};
