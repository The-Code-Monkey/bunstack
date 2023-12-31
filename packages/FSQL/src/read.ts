import { readdir } from 'node:fs/promises';

import DB from '.';

class read<Data extends Record<string, unknown>> {
  public table: string;
  public folder: string;
  public database: string;
  public orderColumn: string;
  public order: 'ASC' | 'DESC' = 'ASC';
  public columnsToGet: string[] = ["*"];
  public limitNumber: number;
  public whereColumn: string[];
  public whereOperator: string[];
  public whereValue: Array<string | number | boolean>;
  public joins: Array<[string, string?]>;
  
  constructor(_this: DB) {
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;
    this.whereColumn = [];
    this.whereOperator = [];
    this.whereValue = [];
    this.joins = [];
  }

  private checkCondition(fileValue: string | number | boolean, operator: string, value: string | number | boolean): boolean {
    switch (operator) {
      case '=':
        return fileValue === value;
      case '!=':
        return fileValue !== value;
      case '>':
        return fileValue > value;
      case '<':
        return fileValue < value;
      // Add more operators as needed
      default:
        return false;
    }
  }

  private async checkFile(entry: string): Promise<Data> {
    const file = await Bun.file(`${this.folder}/${this.database}/${this.table}/${entry}`).json();
  
    // for each whereColumn, whereOperator, whereValue check if the file matches the condition
    let isMatch = true;
    for (let i = 0; i < this.whereColumn.length; i++) {
      if (!this.checkCondition(file[this.whereColumn[i]], this.whereOperator[i], this.whereValue[i])) {
        isMatch = false;
        break;
      }
    }
  
    // if it does, return the file
    if (isMatch) {
      return file;
    }
    // if it doesn't, return null
    return null;
  }

  public join(table: string, column?: string) {
    this.joins = [...this.joins, [table, column]];
    return this;
  }

  public orderBy(column: string, order: 'ASC' | 'DESC') {
    this.orderColumn = column;
    this.order = order;
    return this;
  }

  public columns(...args: string[]) {
    this.columnsToGet = args;
    return this;
  }

  public limit(number: number) {
    this.limitNumber = number;
    return this;
  }

  public where(column: string, operator: string, value: string | number | boolean) {
    this.whereColumn = [...this.whereColumn, column];
    this.whereOperator = [...this.whereOperator, operator];
    this.whereValue = [...this.whereValue, value];
    return this;
  }

  public async get(): Promise<Data[] | string> {
    const schemaPath = Bun.file(`${this.folder}/${this.database}/${this.table}/schema.json`);

    const schemaExists = await schemaPath.exists();

    if (!schemaExists) {
      return `${this.table} - table does not exist`;
    }

    const schema = await schemaPath.json();

    const schemaKeys = Object.keys(schema);

    const files = await readdir(`${this.folder}/${this.database}/${this.table}`);

    const data = files.filter((file) => file !== 'schema.json');

    if (this.columnsToGet[0] !== "*") {
      const invalidColumns = this.columnsToGet.some((column) => !schemaKeys.includes(column));

      if (invalidColumns) {
        return `Invalid column`;
      }

      if (data.length === 0) {
        return [];
      }
    }

    let results: Data[] = [];

    if (this.whereColumn && this.whereColumn.length > 0) {
      const promises = data.map(entry => this.checkFile(entry));
      const promisesResolved = await Promise.all(promises);

      for (const file of promisesResolved) {
        if (file !== null) {
          results.push(file);
        }
      }
    } else {
      // get all data
      for (const entry of data) {
        const file = await Bun.file(`${this.folder}/${this.database}/${this.table}/${entry}`).json();
        results.push(file);
      }
    }

    if (this.order) {
      results.sort((a, b) => {
    const keyA = a[this.orderColumn],
    keyB = b[this.orderColumn];
  
  if (keyA < keyB) return -1;
  if (keyA > keyB) return 1;
  return 0;
});

      if (this.order === "DESC") {
        results.reverse();
      }
    }

    if (this.limitNumber) {
      results = results.slice(0, this.limitNumber);
    }

    if (this.joins.length > 0) {
      for (let j = 0; j < results.length; j++) {
        const join = this.joins[j];
        const hasKey = !!join[1];

        if (hasKey) {
          const newResults: Data[] = [];
          for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const keyValue = result[join[1]] as string;
            const newReadInstance = new read({ table: join[0], folder: this.folder, database: this.database } as DB).where('id', '=', keyValue);
            const value = await newReadInstance.get() as any;
            newResults.push({ ...result, [join[0]]: value } as Data);
          }

          results = newResults;
        } else {
          console.log('here', join, results.length);
          const newResults: Data[] = [];
          for (let i = 0; i < results.length; i++) {
            const result = results[i];
            console.log(result, join, this.table);
            const newReadInstance = (await new DB().init(this.database, this.folder)).read(`${this.table}-${join[0]}`).where(`${this.table}Id`, '=', result.id as string);
            const value = await newReadInstance.get();
            console.log('value', value);
            newResults.push({ ...result, [join[0]]: value } as Data);
          }
          
          results = newResults;
        }
      }
    }

    if (this.columnsToGet[0] != "*") {
      const newResults : Data[] = [];
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const newResult = {};

        for (let j = 0; j < this.columnsToGet.length; j++) {
          const column = this.columnsToGet[j];
          newResult[column] = result[column];
        }

        newResults.push(newResult as Data);
      }

      results = newResults;
    }

    console.log(this.table, results.length);

    return results;
  }
}

export default read;
