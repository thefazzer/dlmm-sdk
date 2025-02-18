

export function memoize<T, R>(
  fn: (arg: T) => R, 
  keyFn: (arg: T) => string = JSON.stringify
): (arg: T) => R {
  const cache = new Map<string, R>();
  
  return (arg: T): R => {
    const key = keyFn(arg);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(arg);
    cache.set(key, result);
    return result;
  };
}