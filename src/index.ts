const sum = (...numbers: number[]): number =>
  numbers.reduce((acc: number, current: number): number => acc + current, 0);

console.log("sum of 2, 3, 10, and 8 = ", sum(2, 3, 10, 8));
