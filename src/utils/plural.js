// "1 name", "3 names", "1 person", "2 people": counts in UI copy.
export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
