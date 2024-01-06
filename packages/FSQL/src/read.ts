// Import the readdir function from the 'fs/promises' module in Node.js. This function is used to read the contents of a directory.
import fs from 'fs-extra';

// Import the default export from the current directory, which is presumably the DB class.
import DB from '.';

// Import utility functions for checking schema existence and invalid columns.
import checkSchemaExists from './utils/checkSchemaExists';
import checkInvalidColumns from './utils/checkInvalidColumns';

// Import the defaultDataTypes from the 'types' utility file.
import { Operators, defaultDataTypes } from './utils/types';

// Define a class named 'read'. This class is a generic class that takes a type parameter 'Data' which extends a record of string keys to unknown values.
class read<Data extends Record<string, unknown>> {
  // Declare public properties for the class.
  public table: string;
  public folder: string;
  public database: string;
  public orderColumn: string;
  public order: 'ASC' | 'DESC' = 'ASC';
  public columnsToGet: string[] = ["*"];
  public limitNumber: number;
  public whereColumn: string[];
  public whereOperator: Array<keyof Operators>;
  public whereValue: Array<defaultDataTypes>;
  public joins: Array<[string, string?]>;

  // Define the constructor for the class, which takes one parameter.
  constructor(_this: DB) {
    // Initialize the table, folder, and database properties from the _this parameter.
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;

    // Initialize the whereColumn, whereOperator, whereValue, and joins properties as empty arrays.
    this.whereColumn = [];
    this.whereOperator = [];
    this.whereValue = [];
    this.joins = [];
  }

  // Define a private method named 'checkCondition'. This method takes three parameters: 'fileValue', 'operator', and 'value'. It returns a boolean value.
  private checkCondition(fileValue: defaultDataTypes, operator: keyof Operators, value: defaultDataTypes): boolean {
    // Define an object 'operators'. Each key in this object is a string representing an operator, and each value is a function that takes two parameters and returns a boolean value.
    const operators: Operators = {
      // The '===' operator checks if the two values are strictly equal (i.e., they are the same type and have the same value).
      '=': (a, b) => a === b,
      // The '!==' operator checks if the two values are not strictly equal.
      '!=': (a, b) => a !== b,
      // The '>' operator checks if the first value is greater than the second value.
      '>': (a, b) => a > b,
      // The '<' operator checks if the first value is less than the second value.
      '<': (a, b) => a < b,
      // The '>=' operator checks if the first value is greater than or equal to the second value.
      '>=': (a, b) => a >= b,
      // The '<=' operator checks if the first value is less than or equal to the second value.
      '<=': (a, b) => a <= b,
      // The 'contains' operator checks if the first value contains the second value. This is typically used for strings or arrays.
      'contains': (a, b) => (a as string).includes(b as string),
      // The 'startsWith' operator checks if the first value starts with the second value. This is typically used for strings.
      'startsWith': (a, b) => (a as string).startsWith(b as string),
      // The 'endsWith' operator checks if the first value ends with the second value. This is typically used for strings.
      'endsWith': (a, b) => (a as string).endsWith(b as string),
      // More operators can be added as needed.
    };

    // Return the result of the operator function for the given 'operator', 'fileValue', and 'value'. If the 'operator' is not found in the 'operators' object, return false.
    return operators[operator] ? operators[operator](fileValue, value) : false;
  }

  // Define a private asynchronous method named 'checkFile'. This method takes a string parameter 'entry' and returns a Promise that resolves to either a 'Data' object or 'null'.
  private async checkFile(entry: string): Promise<Data | null> {
      // Read the JSON file at the specified path and store its content in the 'file' variable. The path is constructed using the 'folder', 'database', 'table', and 'entry' properties.
      const file = await Bun.file(`${this.folder}/${this.database}/${this.table}/${entry}`).json();
      
      // Check if the file matches all conditions specified in the 'whereColumn', 'whereOperator', and 'whereValue' arrays. The 'every' method is used to ensure that all conditions are met.
      const isMatch = this.whereColumn.every((column, i) => 
        this.checkCondition(file[column], this.whereOperator[i], this.whereValue[i])
      );
      
      // If the file matches all conditions (i.e., 'isMatch' is true), return the file. Otherwise, return 'null'.
      return isMatch ? file : null;
  }

  // Define a public method named 'join'. This method takes two parameters: 'table' and 'column'. It returns the current instance of the class (this).
  public join(table: string, column?: string) {
    // Add the 'table' and 'column' to the 'joins' array.
    this.joins = [...this.joins, [table, column]];
    // Return the current instance of the class (this) to allow method chaining.
    return this;
  }

  // Define a public method named 'orderBy'. This method takes two parameters: 'column' and 'order'. It returns the current instance of the class (this).
  public orderBy(column: string, order: 'ASC' | 'DESC') {
    // Set the 'orderColumn' property to the 'column' parameter.
    this.orderColumn = column;
    // Set the 'order' property to the 'order' parameter.
    this.order = order;
    // Return the current instance of the class (this) to allow method chaining.
    return this;
  }

  // Define a public method named 'columns'. This method takes an arbitrary number of string parameters. It returns the current instance of the class (this).
  public columns(...args: string[]) {
    // Set the 'columnsToGet' property to the 'args' array.
    this.columnsToGet = args;
    // Return the current instance of the class (this) to allow method chaining.
    return this;
  }

  // Define a public method named 'limit'. This method takes a number parameter. It returns the current instance of the class (this).
  public limit(number: number) {
    // Set the 'limitNumber' property to the 'number' parameter.
    this.limitNumber = number;
    // Return the current instance of the class (this) to allow method chaining.
    return this;
  }

  // Define a public method named 'where'. This method takes three parameters: 'column', 'operator', and 'value'. It returns the current instance of the class (this).
  public where(column: string, operator: keyof Operators, value: defaultDataTypes) {
    // Add the 'column' parameter to the 'whereColumn' array.
    this.whereColumn = [...this.whereColumn, column];
    // Add the 'operator' parameter to the 'whereOperator' array. The 'operator' parameter is of type 'keyof Operators', which means it can be any key of the 'Operators' type.
    this.whereOperator = [...this.whereOperator, operator];
    // Add the 'value' parameter to the 'whereValue' array.
    this.whereValue = [...this.whereValue, value];
    // Return the current instance of the class (this) to allow method chaining.
    return this;
  }

  // Define an asynchronous private method named 'getFilteredData'. This method takes an array of strings as a parameter and returns a Promise that resolves to an array of Data objects.
  private async getFilteredData(data: string[]): Promise<Data[]> {
    // Initialize an empty array to store the results.
    const results: Data[] = [];
    // Loop over each file in the data array.
    for (const file of data) {
      // Check the file using the 'checkFile' method. This method should be defined in the same class and take a file name as a parameter.
      const checkedFile = await this.checkFile(file);
      // If the file passes the check, add it to the results array.
      if (checkedFile) {
        results.push(checkedFile);
      }
    }
    // Return the results array.
    return results;
  }

  // Define an asynchronous private method named 'getAllData'. This method takes an array of strings as a parameter and returns a Promise that resolves to an array of Data objects.
  private async getAllData(data: string[]): Promise<Data[]> {
    // Initialize an empty array to store the results.
    const results: Data[] = [];
    // Loop over each file in the data array.
    for (const file of data) {
      // Read the file and parse its content as JSON using the 'Bun.file().json()' method.
      const fileContent = await Bun.file(`${this.folder}/${this.database}/${this.table}/${file}`).json();
      // Add the file content to the results array.
      results.push(fileContent);
    }
    // Return the results array.
    return results;
  }

  // Define a private method named 'sortResults'. This method takes an array of Data objects as a parameter and does not return anything.
  private sortResults(results: Data[]): void {
    // Sort the 'results' array in place. The 'sort' method takes a compare function as a parameter.
    results.sort((a, b) => {
      // If the 'orderColumn' property of 'a' is less than the 'orderColumn' property of 'b' when both are treated as strings...
      if ((a[this.orderColumn] as string) < (b[this.orderColumn] as string)) {
        // ...return -1 if 'order' is 'ASC', and 1 otherwise. This will cause 'a' to come before 'b' in the sorted array if 'order' is 'ASC', and 'b' to come before 'a' if 'order' is not 'ASC'.
        return this.order === 'ASC' ? -1 : 1;
      }
      // If the 'orderColumn' property of 'a' is greater than the 'orderColumn' property of 'b' when both are treated as strings...
      if ((a[this.orderColumn] as string) > (b[this.orderColumn] as string)) {
        // ...return 1 if 'order' is 'ASC', and -1 otherwise. This will cause 'a' to come after 'b' in the sorted array if 'order' is 'ASC', and 'b' to come after 'a' if 'order' is not 'ASC'.
        return this.order === 'ASC' ? 1 : -1;
      }
      // If the 'orderColumn' property of 'a' is equal to the 'orderColumn' property of 'b', return 0. This will leave 'a' and 'b' unchanged with respect to each other in the sorted array.
      return 0;
    });
  }

  // Define a private method named 'handleJoins'. This method takes an array of Data objects as a parameter and returns a Promise that resolves to an array of Data objects.
  private async handleJoins(results: Data[]): Promise<Data[]> {
      // Create a new array 'newResults' that is a copy of the 'results' array.
      let newResults = [...results];

      // Iterate over each 'join' in the 'joins' array.
      for (const join of this.joins) {
        // Check if the second element of 'join' is truthy and store the result in 'hasKey'.
        const hasKey = !!join[1];

        // If 'hasKey' is true...
        if (hasKey) {
          // ...map over each 'result' in 'newResults', perform an asynchronous operation for each 'result', and update 'newResults' with the results of these operations.
          newResults = await Promise.all(newResults.map(async result => {
            // Get the value of the property of 'result' that has the key specified by the second element of 'join', and treat it as a string.
            const keyValue = result[join[1]!] as string;
            // Create a new instance of 'read' with the specified table, folder, and database, and set a where condition on it.
            const newReadInstance = new read({ table: join[0], folder: this.folder, database: this.database } as DB).where('id', '=', keyValue);
            // Get the results of the 'read' operation.
            const value = await newReadInstance.get();
            // If 'value' is an array...
            if (Array.isArray(value)) {
              // ...return a new object that has all the properties of 'result' and a new property with the key specified by the first element of 'join' and the value 'value'.
              return { ...result, [join[0]]: value };
            }
            // If 'value' is not an array, return 'result' as it is.
            return result;
          }));
      } else {
        // If 'hasKey' is not true, map over each 'result' in 'newResults', perform an asynchronous operation for each 'result', and update 'newResults' with the results of these operations.
        newResults = await Promise.all(newResults.map(async result => {
          // Create a new instance of 'DB', initialize it with the specified database and folder, create a new 'read' instance with the specified table, and set a where condition on it.
          const newReadInstance = (await new DB().init(this.database, this.folder)).read(`${this.table}-${join[0]}`).where(`${this.table}Id`, '=', result.id as string);
          // Get the results of the 'read' operation.
          const value = await newReadInstance.get();
          // If 'value' is an array...
          if (Array.isArray(value)) {
            // ...return a new object that has all the properties of 'result' and a new property with the key specified by the first element of 'join' and the value 'value'.
            return { ...result, [join[0]]: value };
          }
          // If 'value' is not an array, return 'result' as it is.
          return result;
        }));
      }
      // End of the for loop that iterates over each 'join' in the 'joins' array.
      }
      // Return the 'newResults' array.
      return newResults;
    }


  // Define a private method named 'filterColumns'. This method takes an array of Data objects as a parameter and returns an array of Data objects.
  private filterColumns(results: Data[]): Data[] {
    // Use the 'map' method to create a new array by transforming each 'result' in the 'results' array.
    return results.map(result => {
      // Initialize 'filteredResult' as an empty object that can have any of the properties of a Data object.
      const filteredResult: Partial<Data> = {};
      // Iterate over each 'column' in 'this.columnsToGet'.
      for (const column of this.columnsToGet) {
        // If 'column' is a property of 'result'...
        if (column in result) {
          // ...add a property to 'filteredResult' with the key 'column' and the value of the property of 'result' with the key 'column'.
          filteredResult[column as keyof Data] = result[column as keyof Data];
        }
      }
      // Return 'filteredResult' as a Data object.
      return filteredResult as Data;
    });
  }


  // Define an asynchronous public method named 'get'. This method returns a Promise that resolves to an array of Data objects or a string.
  public async get(): Promise<Data[] | string> {
    // Check if the schema exists for the table in the database and get the path to the schema file.
    const [schemaExists, schemaPath] = await checkSchemaExists(this.table, this.folder, this.database);

    // If the schema does not exist, return a string indicating that the table does not exist.
    if (!schemaExists) {
      return `${this.table} - table does not exist`;
    }

    // Read the schema file and parse it as JSON.
    const schema = await schemaPath.json();
    // Get the keys of the schema object.
    const schemaKeys = Object.keys(schema);
    // Read the directory that contains the table data and get the names of the files in it.
    const files = await fs.readdir(`${this.folder}/${this.database}/${this.table}`);
    // Filter out the 'schema.json' file from the list of files.
    const data = files.filter((file) => file !== 'schema.json');

    // If the columns to get are not all columns...
    if (this.columnsToGet[0] !== "*") {
      // Check if any of the columns to get are not valid columns according to the schema.
      const invalidColumns = this.columnsToGet.some((column) => checkInvalidColumns({ [column]: "" }, schemaKeys).length > 0);

      // If there are any invalid columns, return a string indicating that there is an invalid column.
      if (invalidColumns) {
        return `Invalid column`;
      }

      // If there is no data, return an empty array.
      if (data.length === 0) {
        return [];
      }
    }

    // If there are any conditions specified in the whereColumn array, get the filtered data. Otherwise, get all data.
    let results: Data[] = this.whereColumn && this.whereColumn.length > 0 
      ? await this.getFilteredData(data)
      : await this.getAllData(data);

    // If there is an order specified, sort the results.
    if (this.order) {
      this.sortResults(results);
    }

    // If there is a limit specified, slice the results array to only include the first 'limitNumber' elements.
    if (this.limitNumber) {
      results = results.slice(0, this.limitNumber);
    }

    // If there are any joins specified, handle the joins.
    if (this.joins.length > 0) {
      results = await this.handleJoins(results);
    }

    // If the columns to get are not all columns, filter the results to only include the specified columns.
    if (this.columnsToGet[0] != "*") {
      results = this.filterColumns(results);
    }

    // Return the results.
    return results;
  }
}

export default read;
