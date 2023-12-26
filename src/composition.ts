import * as fs from 'fs/promises';

type CsvCell = string;
type CsvColumns<T> = ReadonlyArray<T>;
type CsvRow = ReadonlyArray<CsvCell>;
type CsvFile = ReadonlyArray<CsvRow>;

(async function () {
  const filename = './src/example.csv';
  const data = await readCsvFile(filename);

  // Chain Functions
  const columnValues = extractColumn(1, data);
  const removedHeaderData = removeRow(0, columnValues);
  const scoreColumnAsFloat = convertTo<number>(parseFloat, removedHeaderData);
  const chainAverageScore = calculateAverageScore(scoreColumnAsFloat);
  console.log({ chainAverageScore });

  // Function Composition
  const scoreColumnIndex = 1;
  const scoreColumnValues = curriedExtractColumn(scoreColumnIndex);

  const headerRowIndex = 0;
  const removeHeaderRow = curriedRemoveRow(headerRowIndex);

  const convertToFloat = curriedConvertTo<number>(parseFloat);
  const compositionAverageScore = pipe(data, scoreColumnValues, removeHeaderRow, convertToFloat, calculateAverageScore);
  console.log({ compositionAverageScore });
})();

async function readCsvFile(filename: string): Promise<CsvFile> {
  const lines = await fs.readFile(filename, 'utf-8');
  return lines.split(/\r\n/).map((line) => line.split(','));
}

function extractColumn(columnIndex: number, data: CsvFile): CsvColumns<CsvCell> {
  return data.map((row) => row[columnIndex]);
}

function removeRow(rowIndex: number, data: CsvColumns<CsvCell>): CsvColumns<CsvCell> {
  return data.filter((_, index) => index !== rowIndex);
}

function convertTo<T>(converter: Function, data: CsvColumns<CsvCell>) {
  return data.map<T>((cell) => converter(cell));
}

function calculateAverageScore(columnValues: CsvColumns<number>) {
  const sum = columnValues.reduce((sum, value) => sum + value, 0);
  return sum / columnValues.length;
}

function curriedExtractColumn(columnIndex: number): Function {
  return (data: CsvFile): CsvColumns<CsvCell> => {
    return data.map((row) => row[columnIndex]);
  };
}

function curriedRemoveRow(rowIndex: number): Function {
  return (data: CsvColumns<CsvCell>): CsvColumns<CsvCell> => {
    return data.filter((_, index) => index !== rowIndex);
  };
}

function curriedConvertTo<T>(converter: Function): Function {
  return (data: CsvColumns<CsvCell>): ReadonlyArray<T> => {
    return data.map((cell) => converter(cell));
  };
}

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
