// Import the 'BunFile' class from the 'bun' module.
import { BunFile } from "bun";

// Define an asynchronous function named 'checkFileExists'. This function takes a string 'path' as a parameter and returns a Promise that resolves to a tuple of a boolean and a 'BunFile'.
async function checkFileExists(path: string): Promise<[boolean, BunFile]> {
  // Call the 'file' method of 'Bun' with 'path' as an argument to create a 'BunFile' instance. Assign this instance to 'file'.
  const file = Bun.file(path);

  // Return a tuple where the first element is the result of calling the 'exists' method of 'file' and the second element is 'file'.
  return [await file.exists(), file];
}

// Export the 'checkFileExists' function as the default export of the module.
export default checkFileExists;