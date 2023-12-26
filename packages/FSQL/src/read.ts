import { readdir } from 'node:fs/promises';

class read<Data> {
  public table: string;
  public folder: string;
  public database: string;
  public orderColumn: string;
  public order: 'ASC' | 'DESC' = 'ASC';
  public columnsToGet: string[] = ["*"];
  public limitNumber: number;
  public whereColumn: string[];
  public whereOperator: string[];
  public whereValue: string[];
  
  constructor(_this: any) {
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;
    this.whereColumn = [];
    this.whereOperator = [];
    this.whereValue = [];
  }

  private checkCondition(fileValue: any, operator: string, value: any): boolean {
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

  private async checkFile(entry: any): Promise<any> {
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

  public where(column: string, operator: string, value: any) {
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

    const result: any[] = [];

    if (this.whereColumn && this.whereColumn.length > 0) {
      const promises = data.map(entry => this.checkFile(entry));
      const promisesResolved = await Promise.all(promises);

      for (const file of promisesResolved) {
        if (file !== null) {
          result.push(file);
        }
      }
    } else {
      // get all data
      for (const entry of data) {
        const file = await Bun.file(`${this.folder}/${this.database}/${this.table}/${entry}`).json();
        result.push(file);
      }
    }

    if (this.order) {
      results.sort((a, b) => {
    var keyA = a[this.orderColumn],
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

    if (this.columnsToGet) {
      results = results.map(result => {
        const newResult = {};
        
        for (const column in this.columnsToGet) {
          newResult[column] = result[column];
        }

        return newResult;
      })
    }

    return result;
  }
}

export default read;
