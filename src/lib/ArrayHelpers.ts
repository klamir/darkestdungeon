export function moveItem <T> (item: T, fromList: T[], toList: T[]) {
  removeItem(fromList, item);
  removeItem(toList, item);
  toList.push(item);
}

export function removeItem <T> (list: T[], item: T) {
  const index = list.indexOf(item);
  if (index !== -1) {
    list.splice(index, 1);
  }
}

export function removeItems <T> (list: T[], items: T[]) {
  items.forEach(removeItem.bind(null, list));
}

export function findSubset <T> (needles: T[], haystack: T[]) {
  const subset: T[] = [];
  for (const needle of needles) {
    if (haystack.indexOf(needle) !== -1) {
      subset.push(needle);
    }
  }
  return subset;
}

export function count (n: number) {
  return range(0, n);
}

export function range (start: number, end: number) {
  const list = [];
  for (let i = start; i < end; i++) {
    list.push(i);
  }
  return list;
}

export function enumMap<T> (e: any): Map<string, T> {
  const map = new Map<string, T>();
  const enumKeys = Object.keys(e);
  for (const key of enumKeys) {
    if (isNaN(parseInt(key, 10))) {
      map.set(key, e[key]);
    }
  }
  return map;
}
