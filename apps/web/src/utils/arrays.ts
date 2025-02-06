export function dedup<T>(arr: T[]): T[] {
  return arr.reduce((acc: T[], item) => {
    return acc.includes(item) ? acc : [...acc, item];
  }, []);
}
