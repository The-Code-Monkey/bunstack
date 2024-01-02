// Import the default export from the current directory, which is presumably the DB class.
import DB from '.';

// Import the checkFileExists utility function.
import checkFileExists from './utils/checkFileExists';

// Define a class named createTable.
class createTable {
  // Declare public properties for the class.
  public table: string;
  public folder: string;
  public database: string;
  public schema: Record<'add' | 'remove', object>;

  // Define the constructor for the class, which takes two parameters.
  constructor(_this: DB, schema: Record<'add' | 'remove', object>) {
    // Initialize the table, folder, and database properties from the _this parameter.
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;

    // Initialize the schema property from the schema parameter.
    this.schema = schema;
  }

  // Define an async method named create.
  public async create(): Promise<number> {
    // Check if the schema file for the table exists.
    const [exists, file] = await checkFileExists(`${this.folder}/${this.database}/${this.table}/schema.json`);

    // If the schema file exists...
    if (exists) {
      // Read the existing schema from the file.
      const data = await file.json();

      // Create a new object that merges the existing schema with the new keys to be added and the keys to be removed.
      const updatedData = {
        ...data,
        ...this.schema.add,
        ...Object.keys(this.schema.remove).reduce((acc, key) => ({ ...acc, [key]: undefined }), {}),
      };

      // Write the updated schema back to the file.
      return await Bun.write(`./${this.folder}/${this.database}/${this.table}/schema.json`, JSON.stringify(updatedData, null, 2));
    } else {
      // If the schema file does not exist, write the new schema to the file.
      return await Bun.write(`./${this.folder}/${this.database}/${this.table}/schema.json`, JSON.stringify(this.schema.add, null, 2));
    }
  }
}

// Export the createTable class as the default export of the module.
export default createTable;