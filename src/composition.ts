import * as fs from 'fs/promises';

type CsvCell = string;
type CsvColumns<T> = ReadonlyArray<T>;
type CsvRow = ReadonlyArray<CsvCell>;
type CsvFile = ReadonlyArray<CsvRow>;

(async function () {
  const filename = './src/example.csv';
  const data = await readCsvFile(filename);

  const scoreColumnIndex = 1;
  const scoreColumnValues = curriedExtractColumn(scoreColumnIndex);

  const headerRowIndex = 0;
  const removeHeaderRow = curriedRemoveRow(headerRowIndex);

  const convertToFloat = curriedConvertTo<number>(parseFloat);

  // Function Composition
  const compositionAverageScore = pipe(data, scoreColumnValues, removeHeaderRow, convertToFloat, calculateAverageScore);
  console.log({ compositionAverageScore });
})();

async function readCsvFile(filename: string): Promise<CsvFile> {
  const lines = await fs.readFile(filename, 'utf-8');
  return lines.split(/\r\n/).map((line) => line.split(','));
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
