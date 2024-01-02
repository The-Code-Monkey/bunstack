// Import the 'BunFile' class from the 'bun' module.
import { BunFile } from "bun";

// Define an asynchronous function named 'checkSchemaExists'. This function takes three strings 'table', 'folder', and 'database' as parameters and returns a Promise that resolves to a tuple of a boolean and a 'BunFile'.
async function checkSchemaExists(table: string, folder: string, database: string): Promise<[boolean, BunFile]> {
  // Construct the path to the schema file and call the 'file' method of 'Bun' with this path as an argument to create a 'BunFile' instance. Assign this instance to 'schemaPath'.
  const schemaPath = Bun.file(`${folder}/${database}/${table}/schema.json`);

  // Return a tuple where the first element is the result of calling the 'exists' method of 'schemaPath' and the second element is 'schemaPath'.
  return [await schemaPath.exists(), schemaPath];
}

// Export the 'checkSchemaExists' function as the default export of the module.
export default checkSchemaExists;