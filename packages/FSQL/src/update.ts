// Importing the default export from the current directory. This is likely a module that exports a class or function.
import DB from '.';

// Importing the 'checkInvalidColumns' function from the 'utils/checkInvalidColumns' module.
import checkInvalidColumns from './utils/checkInvalidColumns';

// Importing the 'checkSchemaExists' function from the 'utils/checkSchemaExists' module.
import checkSchemaExists from './utils/checkSchemaExists';

// Defining a class named 'update'. This class is generic and takes a type parameter 'Data' that extends 'Record<string, unknown>'.
class update<Data extends Record<string, unknown>> {
  // Declaring a public instance variable 'table' of type 'string'.
  public table: string;

  // Declaring a public instance variable 'folder' of type 'string'.
  public folder: string;

  // Declaring a public instance variable 'database' of type 'string'.
  public database: string;

  // Defining the constructor of the class. The constructor takes a parameter '_this' of type 'DB'.
  constructor(_this: DB) {
    // Assigning the 'table' property of '_this' to the 'table' instance variable.
    this.table = _this.table;

    // Assigning the 'folder' property of '_this' to the 'folder' instance variable.
    this.folder = _this.folder;

    // Assigning the 'database' property of '_this' to the 'database' instance variable.
    this.database = _this.database;
  }

  // Define a public asynchronous method named 'update'. This method takes a string 'id' and an object 'data' of type 'Data' as parameters.
  public async update(id: string, data: Data) {
    // Call the 'checkSchemaExists' function with the table, folder, and database as arguments. Destructure the returned array into 'schemaExists' and 'schemaPath'.
    const [schemaExists, schemaPath] = await checkSchemaExists(this.table, this.folder, this.database);

    // If 'schemaExists' is false, return a string indicating that the table does not exist.
    if (!schemaExists) return `${this.table} - table does not exist`;

    // Read the JSON content of 'schemaPath' and assign it to 'schema'.
    const schema = await schemaPath.json();

    // Call the 'checkInvalidColumns' function with 'data' and the keys of 'schema' as arguments. Assign the returned array to 'invalidColumns'.
    const invalidColumns = checkInvalidColumns(data, Object.keys(schema));

    // If 'invalidColumns' is not empty, return a string indicating the invalid columns.
    if (invalidColumns.length > 0) return `Invalid column${invalidColumns.length > 1 ? 's' : ''} - ${invalidColumns.join(', ')}`;

    // Construct the path to the JSON file and assign it to 'path'.
    const path = `${this.folder}/${this.database}/${this.table}/${id}.json`;

    // If the file at 'path' does not exist, return a string indicating that 'id' does not exist.
    if (!(await Bun.file(path).exists())) return `${id} does not exist`;

    // Read the JSON content of the file at 'path', merge it with 'data', and assign the result to 'newData'.
    const newData = { ...await Bun.file(path).json(), ...data };

    // Write 'newData' to the file at 'path'.
    await Bun.write(path, JSON.stringify(newData, null, 2));

    // Return 'newData'.
    return newData;
  }

}

export default update;
