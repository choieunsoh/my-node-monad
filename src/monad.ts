import * as fs from 'fs/promises';

type CsvCell = string;
type CsvColumns<T> = ReadonlyArray<T>;
type CsvRow = ReadonlyArray<CsvCell>;
type CsvFile = ReadonlyArray<CsvRow>;

class Maybe<T> {
  private constructor(private value: T | null, private err?: Error) {}

  static some<T>(value: T) {
    if (!value) {
      throw Error('Provided value must not be empty');
    }
    return new Maybe(value);
  }

  static none<T>(err?: Error) {
    return new Maybe<T>(null, err);
  }

  static fromValue<T>(value: T) {
    return value ? Maybe.some(value) : Maybe.none<T>();
  }

  getErr(): Error {
    return this.err;
  }

  isNone(): boolean {
    return this.value === null;
  }

  getValueOrDefault(defaultValue?: T) {
    return this.value === null ? defaultValue : this.value;
  }

  bind<R>(f: (wrapped: T) => Maybe<R>): Maybe<R> {
    if (this.value === null) {
      return Maybe.none<R>(this.err);
    } else {
      return f(this.value);
    }
  }
}

(async function () {
  // Function Composition
  const filename = './src/example.csv';
  const monadData = await readCsvFile(filename);

  const scoreColumnIndex = 1;
  const scoreColumnValues = extractColumn(scoreColumnIndex);

  const headerRowIndex = 0;
  const removeHeaderRow = removeRow(headerRowIndex);

  const convertToFloat = convertTo<number>(parseFloat);

  const averageScoreMonad = monadData
    .bind<CsvColumns<CsvCell>>(scoreColumnValues)
    .bind<CsvColumns<CsvCell>>(removeHeaderRow)
    .bind<CsvColumns<number>>(convertToFloat)
    .bind<number>(calculateAverageScore);

  if (averageScoreMonad.isNone()) {
    console.log({ err: averageScoreMonad.getErr() });
    return;
  }

  const averageScore = averageScoreMonad.getValueOrDefault();
  console.log({ averageScore });
})();

async function readCsvFile(filename: string): Promise<Maybe<CsvFile>> {
  try {
    const lines = await fs.readFile(filename, 'utf-8');
    const cells = lines.split(/\r\n/).map((line) => line.split(','));
    return Maybe.some(cells);
  } catch (err) {
    return Maybe.none(err);
  }
}

function extractColumn(columnIndex: number) {
  return (data: CsvFile): Maybe<CsvColumns<CsvCell>> => {
    if (!data || data.length === 0 || columnIndex < 0 || columnIndex >= data[0].length) {
      return Maybe.none(new Error(`Column index ${columnIndex} out of range`));
    }

    const columnValues = data.map((row) => row[columnIndex]);
    return Maybe.some(columnValues);
  };
}

function removeRow(rowIndex: number) {
  return (data: CsvColumns<CsvCell>): Maybe<CsvColumns<CsvCell>> => {
    if (rowIndex < 0 || rowIndex >= data.length) {
      return Maybe.none(new Error(`Row index ${rowIndex} out of range`));
    }

    const remainingRows = data.filter((_, index) => index !== rowIndex);
    return Maybe.some(remainingRows);
  };
}

function convertTo<T>(converter: Function) {
  return (data: CsvColumns<CsvCell>): Maybe<ReadonlyArray<T>> => {
    try {
      const convertedValues = data.map<T>((cell) => converter(cell));
      return Maybe.some(convertedValues);
    } catch (err) {
      console.log(err);
      return Maybe.none(err);
    }
  };
}

function calculateAverageScore(data: ReadonlyArray<number>) {
  if (data.length === 0) {
    return Maybe.none<number>(new Error('No data to calculate average score'));
  }

  const sum = data.reduce((sum, value) => sum + value, 0);
  const averageScore = sum / data.length;
  return Maybe.some<number>(averageScore);
}

// Function Composition
function pipe(data: unknown, ...functions: ReadonlyArray<Function>): unknown {
  return functions.reduce((value, func) => func(value), data);
}
