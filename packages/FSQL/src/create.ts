// Import the UUID library to generate unique identifiers.
import { v4 as uuid } from 'uuid';

// Import the default export from the current directory, which is presumably the DB class.
import DB from '.';

// Import utility functions for checking schema existence, invalid columns, and file existence.
import checkSchemaExists from './utils/checkSchemaExists';
import checkInvalidColumns from './utils/checkInvalidColumns';
import checkFileExists from './utils/checkFileExists';

// Import the default data types.
import { defaultDataTypes } from './utils/types';

// Define a type for the default properties of a record.
type createPropsDefault = {
  [x in string]: defaultDataTypes | Date;
}

// Define a type for a single record, which extends the default properties with an optional _id property and custom properties.
export type createPropsSingle<Data> = createPropsDefault & {
  _id?: string;
} & Data;

// Define a type for multiple records, which is an array of single records.
export type createPropsMulti<Data> = Array<createPropsSingle<Data>>;

// Define a class named create.
class create<Data extends Record<string, unknown>> {
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

  // Define an async method named createSingle.
  private async createSingle(props: createPropsSingle<Data>): Promise<Data | string> {
      // Check if the schema for the table exists.
      const [schemaExists, schemaPath] = await checkSchemaExists(this.table, this.folder, this.database);

      // If the schema does not exist, return an error message.
      if (!schemaExists) {
        return `${this.table} - table does not exist`;
      }

      // Read the schema from the file.
      const schema = await schemaPath.json();
      // Get the keys of the schema.
      const schemaKeys = Object.keys(schema);

      // Get the _id property from the props, or generate a new UUID if it does not exist.
      const _id = props._id ?? uuid();
      // Remove the _id property from the props.
      delete props._id;

      // Create a new object with the updated properties.
      const updatedProps: Data = {
        ...props,
        id: _id,
      };

      // Check if the file for the record exists.
      const [fileExists, filePath] = await checkFileExists(`${this.folder}/${this.database}/${this.table}/${_id}.json`);

      // If the file exists, return an error message.
      if (fileExists) {
        return `${_id} already exists`;
      }

      // Check for invalid columns in the updated properties.
      const invalidColumns = checkInvalidColumns(updatedProps, schemaKeys);

      // If there are invalid columns, return an error message.
      if (invalidColumns.length > 0) {
        return `Invalid column${invalidColumns.length > 1 ? 's' : ''} - ${invalidColumns.join(', ')}`;
      }

      // Write the updated properties to the file.
      await Bun.write(filePath, JSON.stringify(updatedProps, null, 2));
      // Return the updated properties.
      return updatedProps;
  }

  // Define an async method named createMulti.
  private async createMulti(props: createPropsMulti<Data>): Promise<string | Data[]> {
      // Check if the schema for the table exists.
      const [schemaExists, schemaPath] = await checkSchemaExists(this.table, this.folder, this.database);

      // If the schema does not exist, return an error message.
      if (!schemaExists) {
        return `${this.table} - table does not exist`;
      }

      // Read the schema from the file.
      const schema = await schemaPath.json();
      // Get the keys of the schema.
      const schemaKeys = Object.keys(schema);

      // Check for invalid columns in the props.
      const invalidColumns = props.flatMap(entry => checkInvalidColumns(entry, schemaKeys));

      // If there are invalid columns, return an error message.
      if (invalidColumns.length > 0) {
        return `Invalid column${invalidColumns.length > 1 ? 's' : ''} - ${invalidColumns.join(', ')}`;
      }

      // Create the records using the createSingle method and wait for all promises to resolve.
      const responses = await Promise.all(props.map(entry => this.createSingle(entry)));

      // Find the first error response.
      const errorResponse = responses.find(response => typeof response === 'string');
      // If there is an error response, return it.
      if (errorResponse) {
        return errorResponse as string;
      }

      // If there are no error responses, return the responses.
      return responses as Data[];
  }

  // Define a public method named 'create'. This method takes one parameter 'props' which can be either a single record or an array of records.
  public create = (props: createPropsSingle<Data> | createPropsMulti<Data>): Promise<Data | string | Data[]> =>

      // Check if 'props' is an array. This is done using the 'Array.isArray' method.
      Array.isArray(props) 

        // If 'props' is an array, call the 'createMulti' method with 'props' as the argument. The 'as' keyword is used to assert that 'props' is of type 'createPropsMulti<Data>'.
        ? this.createMulti(props as createPropsMulti<Data>) 

        // If 'props' is not an array, call the 'createSingle' method with 'props' as the argument. The 'as' keyword is used to assert that 'props' is of type 'createPropsSingle<Data>'.
        : this.createSingle(props as createPropsSingle<Data>);
}

export default create;