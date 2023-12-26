// Currying
const add = (a: number) => (b: number) => a + b;
const subtract = (a: number) => (b: number) => b - a;
const multiply = (a: number) => (b: number) => a * b;

const addByTwo = add(2);
const multiplyByThree = multiply(3);
const subtractByFive = subtract(5);

// Function Composition
function pipe(data: unknown, ...functions: ReadonlyArray<Function>): unknown {
  return functions.reduce((value, func) => func(value), data);
}

const num = 2;
const basicCall = subtractByFive(multiplyByThree(addByTwo(num)));
const chainCall = pipe(num, addByTwo, multiplyByThree, subtractByFive);
console.log({ basicCall });
console.log({ chainCall });
