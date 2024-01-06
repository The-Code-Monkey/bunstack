// Import the unlink function from the 'fs/promises' module in Node.js. This function is used to delete files.
import { unlink } from "fs-extra";

// Import the default export from the current directory, which is presumably the DB class.
import DB from '.';

// Import utility functions for checking schema existence and file existence.
import checkSchemaExists from "./utils/checkSchemaExists";
import checkFileExists from "./utils/checkFileExists";

// Define a class named 'deleteFn'.
class deleteFn {
  // Declare public properties for the class.
  public table: string;
  public folder: string;
  public database: string;

  // Define the constructor for the class, which takes one parameter.
  constructor(_this: DB) {
    // Initialize the table, folder, and database properties from the _this parameter.
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;
  }

  // Define an async method named 'delete'. This method takes one parameter 'id' which is the id of the record to be deleted.
  public async delete(id: string) {
    // Check if the schema for the table exists.
    const [schemaExists] = await checkSchemaExists(this.table, this.folder, this.database);

    // If the schema does not exist, return an error message.
    if (!schemaExists) {
      return `${this.table} - table does not exist`;
    }

    // Define the path of the file to be deleted.
    const path = `${this.folder}/${this.database}/${this.table}/${id}.json`;

    // Check if the file exists.
    const [fileExists] = await checkFileExists(path);

    // If the file does not exist, return an error message.
    if (!fileExists) {
      return `${id} does not exist`;
    }

    // Delete the file.
    await unlink(path);

    // Return a success message.
    return `Successfully deleted the entry`;
  }
}

// Export the 'deleteFn' class as the default export of the module.
export default deleteFn;