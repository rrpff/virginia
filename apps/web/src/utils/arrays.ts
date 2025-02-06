export function dedup<T>(arr: T[]): T[] {
  return arr.reduce((acc: T[], item) => {
    return acc.includes(item) ? acc : [...acc, item];
  }, []);
}

export function sortBy<T, K>(predicate: (elem: T) => K, direction = -1) {
  return (a: T, b: T) => {
    const aVal = predicate(a);
    const bVal = predicate(b);
    if (aVal > bVal) return direction;
    if (bVal > aVal) return -direction;
    return 0;
  };
}
