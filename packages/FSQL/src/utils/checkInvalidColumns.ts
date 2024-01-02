// Define a function named 'checkInvalidColumns'. This function takes an object 'updatedProps' and an array of strings 'schemaKeys' as parameters and returns an array of strings.
function checkInvalidColumns(updatedProps: Record<string, unknown>, schemaKeys: string[]): string[] {
  // Return an array that contains the keys of 'updatedProps' that are not equal to '_id' and are not included in 'schemaKeys'.
  return Object.keys(updatedProps).filter((column) => column !== '_id' && !schemaKeys.includes(column));
}

// Export the 'checkInvalidColumns' function as the default export of the module.
export default checkInvalidColumns;