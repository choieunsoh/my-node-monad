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
