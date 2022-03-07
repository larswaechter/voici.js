/**
 * Count the occurrences of each value.
 *
 * @param data - The dataset
 * @returns A `Map<Value, Occurrence>` map
 */
export const countOccurrences = (data: any[]) => {
  const table = new Map<string, number>();

  for (const value of data) {
    const str = String(value);
    if (str === 'undefined') continue;

    if (table.has(str)) {
      table.set(str, table.get(str) + 1);
    } else table.set(str, 1);
  }

  return table;
};
